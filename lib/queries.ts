// lib/queries.ts
// All SPARQL queries used in the application

import { PREFIX } from "./sparql";

function escapeSparqlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildTechnologyPattern(category?: string) {
  if (category && category !== "all") {
    return `
  ?tech a ex:${category} .
  BIND(ex:${category} AS ?type)
  OPTIONAL { ex:${category} rdfs:label ?explicitTypeLabel }
  OPTIONAL { ?tech rdfs:label ?label }
  OPTIONAL { ?tech ex:description ?description }
  OPTIONAL { ?tech ex:website ?website }
  OPTIONAL { ?tech ex:version ?version }
  OPTIONAL { ?tech ex:githubStars ?githubStars }
  BIND(COALESCE(?explicitTypeLabel, "${category}") AS ?typeLabel)
`;
  }

  return `
  ?tech a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  OPTIONAL { ?tech rdfs:label ?label }
  OPTIONAL { ?tech ex:description ?description }
  OPTIONAL { ?tech ex:website ?website }
  OPTIONAL { ?tech ex:version ?version }
  OPTIONAL { ?tech ex:githubStars ?githubStars }
  OPTIONAL { ?type rdfs:label ?typeLabel }
  FILTER(?type != ex:Technology)
`;
}

/**
 * Get all technologies with their type and label
 */
export const getAllTechnologiesQuery = () => `
${PREFIX}
SELECT DISTINCT ?tech ?label ?type ?typeLabel ?description ?website ?version ?githubStars
WHERE {
${buildTechnologyPattern()}
}
ORDER BY ?typeLabel ?label
`;

/**
 * Search technologies by keyword (in label or description)
 */
export const searchTechnologiesQuery = (keyword: string) => {
  const escaped = escapeSparqlString(keyword);
  return `
${PREFIX}
SELECT DISTINCT ?tech ?label ?type ?typeLabel ?description ?website ?version
WHERE {
${buildTechnologyPattern()}
  FILTER(
    CONTAINS(LCASE(STR(?label)), LCASE("${escaped}")) ||
    CONTAINS(LCASE(STR(?description)), LCASE("${escaped}")) ||
    CONTAINS(LCASE(STR(?typeLabel)), LCASE("${escaped}"))
  )
}
ORDER BY ?typeLabel ?label
`;
};

/**
 * Search technologies by keyword and optional ontology category.
 */
export const searchTechnologiesByCategoryQuery = (keyword: string, category?: string) => {
  const escaped = escapeSparqlString(keyword);
  return `
${PREFIX}
SELECT DISTINCT ?tech ?label ?type ?typeLabel ?description ?website ?version ?githubStars
WHERE {
${buildTechnologyPattern(category)}
  FILTER(
    CONTAINS(LCASE(STR(?label)), LCASE("${escaped}")) ||
    CONTAINS(LCASE(STR(?description)), LCASE("${escaped}")) ||
    CONTAINS(LCASE(STR(?typeLabel)), LCASE("${escaped}"))
  )
}
ORDER BY ?typeLabel ?label
`;
};

/**
 * Get technologies by category
 */
export const getTechByCategoryQuery = (category: string) => `
${PREFIX}
SELECT DISTINCT ?tech ?label ?type ?typeLabel ?description ?website ?version ?githubStars
WHERE {
${buildTechnologyPattern(category)}
}
ORDER BY ?label
`;

/**
 * Get a single technology detail by local name
 */
export const getTechDetailQuery = (name: string) => `
${PREFIX}
SELECT DISTINCT ?label ?type ?typeLabel ?description ?website ?version ?githubStars ?license ?firstRelease ?creator ?npmPackage
WHERE {
  ex:${name} a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  OPTIONAL { ex:${name} rdfs:label ?label }
  OPTIONAL { ex:${name} ex:description ?description }
  OPTIONAL { ex:${name} ex:website ?website }
  OPTIONAL { ex:${name} ex:version ?version }
  OPTIONAL { ex:${name} ex:githubStars ?githubStars }
  OPTIONAL { ex:${name} ex:license ?license }
  OPTIONAL { ex:${name} ex:firstRelease ?firstRelease }
  OPTIONAL { ex:${name} ex:creator ?creator }
  OPTIONAL { ex:${name} ex:npmPackage ?npmPackage }
  OPTIONAL { ?type rdfs:label ?typeLabel }
  FILTER(?type != ex:Technology)
}
`;

/**
 * Get related technologies for a given tech node
 */
export const getTechRelationsQuery = (name: string) => `
${PREFIX}
SELECT DISTINCT ?property ?relatedTech ?relatedLabel ?relatedWebsite
WHERE {
  {
    ex:${name} ?property ?relatedTech .
    ?relatedTech a ?t .
    ?t rdfs:subClassOf* ex:Technology .
    OPTIONAL { ?relatedTech rdfs:label ?relatedLabel }
    OPTIONAL { ?relatedTech ex:website ?relatedWebsite }
    FILTER(?property != rdf:type)
  }
  UNION
  {
    ?relatedTech ?property ex:${name} .
    ?relatedTech a ?t .
    ?t rdfs:subClassOf* ex:Technology .
    OPTIONAL { ?relatedTech rdfs:label ?relatedLabel }
    OPTIONAL { ?relatedTech ex:website ?relatedWebsite }
    FILTER(?property != rdf:type)
  }
}
`;

/**
 * Count stats per category
 */
export const getStatsQuery = () => `
${PREFIX}
SELECT ?type ?typeLabel (COUNT(?tech) AS ?count)
WHERE {
  ?tech a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  FILTER(?type != ex:Technology)
  OPTIONAL { ?type rdfs:label ?typeLabel }
}
GROUP BY ?type ?typeLabel
ORDER BY DESC(?count)
`;
