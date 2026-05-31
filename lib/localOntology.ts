import fs from "node:fs/promises";
import path from "node:path";
import { Parser } from "n3";
import { localName } from "./sparql";
import type { Technology } from "./types";

const EX = "http://webdev.id/ontology#";
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
const RDFS_SUBCLASS = "http://www.w3.org/2000/01/rdf-schema#subClassOf";
const RDFS_COMMENT = "http://www.w3.org/2000/01/rdf-schema#comment";

type LocalRelationMap = Record<string, { name: string; label: string }[]>;

interface LocalTechDetail extends Technology {
  relations: LocalRelationMap;
}

interface LocalOntologyIndex {
  technologies: Technology[];
  technologiesByName: Map<string, LocalTechDetail>;
  classLabels: Map<string, string>;
  classChildren: Map<string, Set<string>>;
}

let ontologyPromise: Promise<LocalOntologyIndex> | null = null;

function getOntologyPath() {
  return path.join(process.cwd(), "ontology", "webdev.ttl");
}

function isTechClass(classUri: string, classChildren: Map<string, Set<string>>) {
  if (classUri === `${EX}Technology`) return false;

  const queue = [classUri];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift() as string;
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === `${EX}Technology`) return true;

    const parents = classChildren.get(current);
    if (parents) {
      for (const parent of Array.from(parents)) queue.push(parent);
    }
  }

  return false;
}

async function loadLocalOntology(): Promise<LocalOntologyIndex> {
  const ttl = await fs.readFile(getOntologyPath(), "utf8");
  const parser = new Parser();
  const quads = parser.parse(ttl);

  const directTypesBySubject = new Map<string, Set<string>>();
  const classLabels = new Map<string, string>();
  const classChildren = new Map<string, Set<string>>();
  const literalValues = new Map<string, Record<string, string[]>>();
  const resourceValues = new Map<string, Record<string, Set<string>>>();

  for (const quad of quads) {
    const subject = quad.subject.value;
    const predicate = quad.predicate.value;
    const object = quad.object.value;

    if (predicate === RDFS_LABEL && quad.subject.termType === "NamedNode") {
      classLabels.set(subject, object);
    }

    if (predicate === RDFS_SUBCLASS && quad.subject.termType === "NamedNode" && quad.object.termType === "NamedNode") {
      if (!classChildren.has(subject)) classChildren.set(subject, new Set());
      classChildren.get(subject)?.add(object);
    }

    if (predicate === RDF_TYPE && quad.subject.termType === "NamedNode" && quad.object.termType === "NamedNode") {
      if (!directTypesBySubject.has(subject)) directTypesBySubject.set(subject, new Set());
      directTypesBySubject.get(subject)?.add(object);
    }

    if (quad.subject.termType !== "NamedNode") continue;

    if (quad.object.termType === "Literal") {
      if (!literalValues.has(subject)) literalValues.set(subject, {});
      const subjectValues = literalValues.get(subject) as Record<string, string[]>;
      if (!subjectValues[predicate]) subjectValues[predicate] = [];
      subjectValues[predicate].push(quad.object.value);
    }

    if (quad.object.termType === "NamedNode") {
      if (!resourceValues.has(subject)) resourceValues.set(subject, {});
      const subjectValues = resourceValues.get(subject) as Record<string, Set<string>>;
      if (!subjectValues[predicate]) subjectValues[predicate] = new Set();
      subjectValues[predicate].add(object);
    }
  }

  const technologies: Technology[] = [];
  const technologiesByName = new Map<string, LocalTechDetail>();

  const techSubjects = Array.from(directTypesBySubject.entries()).filter(([, types]) =>
    Array.from(types).some((type) => isTechClass(type, classChildren))
  );

  for (const [subject, directTypes] of techSubjects) {
    const typeUri = Array.from(directTypes).find((type) => isTechClass(type, classChildren)) || `${EX}Technology`;
    const name = localName(subject);
    const typeLabel = classLabels.get(typeUri) || localName(typeUri);
    const label = literalValues.get(subject)?.[RDFS_LABEL]?.[0] || name;
    const description = literalValues.get(subject)?.[RDFS_COMMENT]?.[0] || literalValues.get(subject)?.[`${EX}description`]?.[0] || "";
    const website = literalValues.get(subject)?.[`${EX}website`]?.[0] || "";
    const version = literalValues.get(subject)?.[`${EX}version`]?.[0] || "";
    const githubStars = literalValues.get(subject)?.[`${EX}githubStars`]?.[0] || "";

    const relations: LocalRelationMap = {};
    const subjectResources = resourceValues.get(subject) || {};

    for (const [predicate, targets] of Object.entries(subjectResources)) {
      if (!predicate.startsWith(EX)) continue;
      const prop = localName(predicate);
      for (const target of Array.from(targets)) {
        const targetName = localName(target);
        const targetLabel = literalValues.get(target)?.[RDFS_LABEL]?.[0] || targetName;
        if (!relations[prop]) relations[prop] = [];
        if (!relations[prop].some((item) => item.name === targetName)) {
          relations[prop].push({ name: targetName, label: targetLabel });
        }
      }
    }

    const tech: LocalTechDetail = {
      uri: subject,
      name,
      label,
      type: localName(typeUri),
      typeLabel,
      description,
      website,
      version,
      githubStars,
      relations,
    };

    technologies.push(tech);
    technologiesByName.set(name, tech);
  }

  technologies.sort((a, b) => `${a.typeLabel} ${a.label}`.localeCompare(`${b.typeLabel} ${b.label}`));

  return { technologies, technologiesByName, classLabels, classChildren };
}

export async function getLocalOntologyIndex() {
  if (!ontologyPromise) {
    ontologyPromise = loadLocalOntology();
  }

  return ontologyPromise;
}

export async function getLocalTechnologies() {
  const index = await getLocalOntologyIndex();
  return index.technologies;
}

export async function getLocalTechnologiesByCategory(category: string) {
  const index = await getLocalOntologyIndex();
  if (!category || category === "all") return index.technologies;
  return index.technologies.filter((tech) => tech.type === category || tech.typeLabel === category);
}

export async function searchLocalTechnologies(keyword: string, category?: string) {
  const index = await getLocalOntologyIndex();
  const normalized = keyword.trim().toLowerCase();
  const items = category && category !== "all"
    ? index.technologies.filter((tech) => tech.type === category || tech.typeLabel === category)
    : index.technologies;

  if (!normalized) return items;

  return items.filter((tech) => {
    return [tech.label, tech.description, tech.type, tech.typeLabel]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalized));
  });
}

export async function getLocalTechDetail(name: string) {
  const index = await getLocalOntologyIndex();
  return index.technologiesByName.get(name) || null;
}

export async function getLocalStats() {
  const items = await getLocalTechnologies();
  const counts: Record<string, number> = {};

  for (const item of items) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([type, count]) => ({ type, typeLabel: type, count }))
    .sort((a, b) => b.count - a.count);
}