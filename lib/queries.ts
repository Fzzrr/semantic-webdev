// lib/queries.ts
// All SPARQL queries used in the application

import { PREFIX } from "./sparql";

/**
 * Get all technologies with their type and label
 */
export const getAllTechnologiesQuery = () => `
${PREFIX}
SELECT DISTINCT ?tech ?label ?type ?typeLabel ?description ?website ?version ?githubStars
WHERE {
  ?tech a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  OPTIONAL { ?tech rdfs:label ?label }
  OPTIONAL { ?tech ex:description ?description }
  OPTIONAL { ?tech ex:website ?website }
  OPTIONAL { ?tech ex:version ?version }
  OPTIONAL { ?tech ex:githubStars ?githubStars }
  OPTIONAL { ?type rdfs:label ?typeLabel }
  FILTER(?type != ex:Technology)
}
ORDER BY ?typeLabel ?label
`;

/**
 * Search technologies by keyword (in label or description)
 */
export const searchTechnologiesQuery = (keyword: string) => {
  const escaped = keyword.replace(/"/g, '\\"');
  return `
${PREFIX}
SELECT DISTINCT ?tech ?label ?type ?typeLabel ?description ?website ?version
WHERE {
  ?tech a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  OPTIONAL { ?tech rdfs:label ?label }
  OPTIONAL { ?tech ex:description ?description }
  OPTIONAL { ?tech ex:website ?website }
  OPTIONAL { ?tech ex:version ?version }
  OPTIONAL { ?type rdfs:label ?typeLabel }
  FILTER(?type != ex:Technology)
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
  ?tech a ex:${category} .
  BIND(ex:${category} AS ?type)
  OPTIONAL { ?tech rdfs:label ?label }
  OPTIONAL { ?tech ex:description ?description }
  OPTIONAL { ?tech ex:website ?website }
  OPTIONAL { ?tech ex:version ?version }
  OPTIONAL { ?tech ex:githubStars ?githubStars }
  BIND("${category}" AS ?typeLabel)
}
ORDER BY ?label
`;

/**
 * Get a single technology detail by local name
 */
export const getTechDetailQuery = (name: string) => `
${PREFIX}
SELECT DISTINCT ?label ?type ?typeLabel ?description ?website ?version ?githubStars
WHERE {
  ex:${name} a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  OPTIONAL { ex:${name} rdfs:label ?label }
  OPTIONAL { ex:${name} ex:description ?description }
  OPTIONAL { ex:${name} ex:website ?website }
  OPTIONAL { ex:${name} ex:version ?version }
  OPTIONAL { ex:${name} ex:githubStars ?githubStars }
  OPTIONAL { ?type rdfs:label ?typeLabel }
  FILTER(?type != ex:Technology)
}
`;

/**
 * Get related technologies for a given tech node
 */
export const getTechRelationsQuery = (name: string) => `
${PREFIX}
SELECT DISTINCT ?property ?relatedTech ?relatedLabel
WHERE {
  {
    ex:${name} ?property ?relatedTech .
    ?relatedTech a ?t .
    ?t rdfs:subClassOf* ex:Technology .
    OPTIONAL { ?relatedTech rdfs:label ?relatedLabel }
    FILTER(?property != rdf:type)
  }
  UNION
  {
    ?relatedTech ?property ex:${name} .
    ?relatedTech a ?t .
    ?t rdfs:subClassOf* ex:Technology .
    OPTIONAL { ?relatedTech rdfs:label ?relatedLabel }
    FILTER(?property != rdf:type)
  }
}
`;

/**
 * Get all ORMs for a specific database
 */
export const getORMsForDatabaseQuery = (dbName: string) => `
${PREFIX}
SELECT ?orm ?label
WHERE {
  ?orm a ex:ORM ;
       ex:isORMFor ex:${dbName} .
  OPTIONAL { ?orm rdfs:label ?label }
}
ORDER BY ?label
`;

/**
 * Get all frameworks using a specific library
 */
export const getFrameworksForLibraryQuery = (libName: string) => `
${PREFIX}
SELECT ?framework ?label
WHERE {
  ?framework a ex:Framework ;
             ex:isFrameworkOf ex:${libName} .
  OPTIONAL { ?framework rdfs:label ?label }
}
ORDER BY ?label
`;

/**
 * Count stats per category
 */
export const getStatsQuery = () => `
${PREFIX}
SELECT ?typeLabel (COUNT(?tech) AS ?count)
WHERE {
  ?tech a ?type .
  ?type rdfs:subClassOf* ex:Technology .
  FILTER(?type != ex:Technology)
  OPTIONAL { ?type rdfs:label ?typeLabel }
}
GROUP BY ?typeLabel
ORDER BY DESC(?count)
`;
