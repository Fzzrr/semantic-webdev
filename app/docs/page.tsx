"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { CATEGORIES } from "@/lib/types";

const RELATIONS = [
  { pred: "isFrameworkOf",       label: "isFrameworkOf",       desc: "Links a framework to the library/technology it is built upon.",                    domain: "Framework", range: "Library / Runtime" },
  { pred: "isORMFor",            label: "isORMFor",            desc: "Links an ORM to the databases it supports.",                                       domain: "ORM", range: "Database" },
  { pred: "isBuiltOn",           label: "isBuiltOn",           desc: "A technology built on top of a specific runtime or platform.",                     domain: "Framework / Library", range: "Runtime / Language" },
  { pred: "implementsSpec",      label: "implementsSpec",      desc: "Implementation of a semantic web standard or specification.",                      domain: "Triplestore / Tool", range: "SemanticWebSpec" },
  { pred: "usesLanguage",        label: "usesLanguage",        desc: "The programming language used by a technology.",                                   domain: "Framework / Library", range: "Language" },
  { pred: "compatibleWith",      label: "compatibleWith",      desc: "Direct compatibility between two technologies.",                                   domain: "Technology", range: "Technology" },
  { pred: "alternativeTo",       label: "alternativeTo",       desc: "Technologies that can be used as alternatives to one another.",                    domain: "Technology", range: "Technology" },
  { pred: "connectsTo",          label: "connectsTo",          desc: "Technologies that connect directly within the ecosystem.",                         domain: "Technology", range: "Technology" },
  { pred: "integratesWith",      label: "integratesWith",      desc: "Official or common integration between two technologies.",                         domain: "Technology", range: "Technology" },
  { pred: "testedWith",          label: "testedWith",          desc: "Recommended or commonly used testing tools.",                                      domain: "Framework / Library", range: "TestingTool" },
  { pred: "deployedOn",          label: "deployedOn",          desc: "Cloud platform or infrastructure where the technology is deployed.",               domain: "Framework / Runtime", range: "CloudProvider / DeploymentTool" },
  { pred: "managedBy",           label: "managedBy",           desc: "A technology managed by a particular package manager.",                            domain: "Library / Framework", range: "PackageManager" },
  { pred: "hostedBy",            label: "hostedBy",            desc: "The hosting service that provides the technology.",                                domain: "Database / Storage", range: "CloudProvider" },
  { pred: "monitoredBy",         label: "monitoredBy",         desc: "Monitoring tools used to track performance.",                                      domain: "Technology", range: "MonitoringTool" },
  { pred: "ciWith",              label: "ciWith",              desc: "CI/CD pipeline used in the deployment process.",                                   domain: "Framework / Runtime", range: "CITool" },
  { pred: "usesBroker",          label: "usesBroker",          desc: "Message broker used for inter-service communication.",                             domain: "Framework / Runtime", range: "MessageBroker" },
  { pred: "searchedWith",        label: "searchedWith",        desc: "Search engine used for full-text search.",                                         domain: "Database / Framework", range: "SearchTool" },
  { pred: "storedWith",          label: "storedWith",          desc: "Object or file storage service used.",                                             domain: "Framework / Runtime", range: "StorageService" },
  { pred: "designedWith",        label: "designedWith",        desc: "Design tools used in the UI development workflow.",                                domain: "Framework / UILib", range: "DesignTool" },
  { pred: "versionControlledBy", label: "versionControlledBy", desc: "Version control system used to manage the code.",                                  domain: "Technology", range: "VersionControl" },
];

const PREFIX_BLOCK = `PREFIX ex:   <http://webdev.id/ontology#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>`;

const SECTIONS = [
  { id: "about",        label: "About the Project" },
  { id: "architecture", label: "Ontology Architecture" },
  { id: "categories",   label: "Technology Categories" },
  { id: "relations",    label: "Predicates & Relations" },
  { id: "sparql",       label: "SPARQL Endpoint" },
  { id: "examples",     label: "Example Queries" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#131313] tech-grid-bg text-[#e5e2e1]">
      <Navbar />

      <div className="pt-16 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-10 py-10">
        {/* Sidebar nav */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <p className="text-[10px] font-mono text-[#838383] uppercase tracking-widest mb-4">Table of Contents</p>
            <nav className="space-y-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-xs font-mono text-[#838383] hover:text-[#b4c5ff] py-1 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </nav>

            <div className="mt-8 p-3 bg-[#1b1b1b] border border-[#333333] rounded-xl">
              <p className="text-[9px] font-mono text-[#838383] uppercase tracking-wider mb-2">Quick Links</p>
              <div className="space-y-1.5">
                <Link href="/" className="flex items-center gap-1.5 text-[10px] font-mono text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors">
                  <span className="material-symbols-outlined text-[12px]">explore</span>
                  Explorer
                </Link>
                <Link href="/sparql" className="flex items-center gap-1.5 text-[10px] font-mono text-[#c3c6d7] hover:text-[#b4c5ff] transition-colors">
                  <span className="material-symbols-outlined text-[12px]">hub</span>
                  SPARQL Lab
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-16">

          {/* About */}
          <section id="about">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#b4c5ff]/10 border border-[#b4c5ff]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">info</span>
              </div>
              <h2 className="text-xl font-headline font-bold text-[#e5e2e1]">About the Project</h2>
            </div>
            <div className="prose-custom space-y-4 text-sm text-[#c3c6d7] leading-relaxed">
              <p>
                <strong className="text-[#e5e2e1]">WebDev Semantic Directory</strong> is a web development technology directory powered by
                the Semantic Web. The project uses an OWL/RDF ontology to represent knowledge about hundreds of
                technologies and the relationships between them.
              </p>
              <p>
                Data is stored in the Turtle format (<code className="text-[#b4c5ff] bg-[#1b1b1b] px-1.5 py-0.5 rounded text-xs">.ttl</code>) and
                can be queried with SPARQL through Apache Jena Fuseki, or directly from the local ontology file using the N3.js parser.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  { icon: "category", label: "30+ Categories" },
                  { icon: "hub", label: "20 Relation Types" },
                  { icon: "devices", label: "100+ Technologies" },
                  { icon: "code", label: "SPARQL Ready" },
                ].map((item) => (
                  <div key={item.label} className="bg-[#1b1b1b] border border-[#333333] rounded-xl p-4 flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[#b4c5ff] text-2xl">{item.icon}</span>
                    <span className="text-xs font-mono text-[#c3c6d7]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#b4c5ff]/10 border border-[#b4c5ff]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">account_tree</span>
              </div>
              <h2 className="text-xl font-headline font-bold text-[#e5e2e1]">Ontology Architecture</h2>
            </div>
            <div className="space-y-4 text-sm text-[#c3c6d7] leading-relaxed">
              <p>
                The ontology uses the namespace <code className="text-[#b4c5ff] bg-[#1b1b1b] px-1.5 py-0.5 rounded text-xs">http://webdev.id/ontology#</code>.
                All technology classes are subclasses of <code className="text-[#b4c5ff] bg-[#1b1b1b] px-1.5 py-0.5 rounded text-xs">ex:Technology</code>.
              </p>
              <div className="bg-[#0e0e0e] border border-[#333333] rounded-xl p-5">
                <p className="text-[10px] font-mono text-[#838383] uppercase tracking-wider mb-3">Class Hierarchy</p>
                <pre className="text-xs font-mono text-[#c3c6d7] leading-relaxed overflow-x-auto">
{`ex:Technology
├── ex:Framework
│   ├── ex:MobileFramework
│   └── ex:DesktopFramework
├── ex:Library
│   ├── ex:UIComponentLib
│   ├── ex:CSSFramework
│   ├── ex:StateManagement
│   ├── ex:Animation
│   └── ex:ValidationLib
├── ex:Database
├── ex:ORM
├── ex:Language
├── ex:Runtime
├── ex:BuildTool
├── ex:TestingTool
├── ex:CloudProvider
├── ex:DeploymentTool
├── ex:CITool
└── ... (30+ categories)`}
                </pre>
              </div>
              <div className="bg-[#0e0e0e] border border-[#333333] rounded-xl p-5">
                <p className="text-[10px] font-mono text-[#838383] uppercase tracking-wider mb-3">Prefixes Used</p>
                <pre className="text-xs font-mono text-[#b4c5ff] leading-relaxed">{PREFIX_BLOCK}</pre>
              </div>
              <div className="bg-[#0e0e0e] border border-[#333333] rounded-xl p-5">
                <p className="text-[10px] font-mono text-[#838383] uppercase tracking-wider mb-3">Example Technology Declaration (Turtle)</p>
                <pre className="text-xs font-mono text-[#c3c6d7] leading-relaxed">
{`ex:NextJS a ex:Framework ;
    rdfs:label "Next.js" ;
    ex:description "React framework for production" ;
    ex:website "https://nextjs.org" ;
    ex:version "14.0" ;
    ex:githubStars "120000" ;
    ex:usesLanguage ex:JavaScript, ex:TypeScript ;
    ex:isBuiltOn ex:NodeJS ;
    ex:isFrameworkOf ex:React ;
    ex:deployedOn ex:Vercel .`}
                </pre>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section id="categories">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#b4c5ff]/10 border border-[#b4c5ff]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">category</span>
              </div>
              <h2 className="text-xl font-headline font-bold text-[#e5e2e1]">Technology Categories</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                <div
                  key={cat.value}
                  className="flex items-center gap-2 bg-[#1b1b1b] border border-[#333333] rounded-lg px-3 py-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b4c5ff]/60 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-mono text-[#e5e2e1]">{cat.label}</p>
                    <p className="text-[9px] font-mono text-[#838383]">ex:{cat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Relations */}
          <section id="relations">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#b4c5ff]/10 border border-[#b4c5ff]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">swap_horiz</span>
              </div>
              <h2 className="text-xl font-headline font-bold text-[#e5e2e1]">Predicates & Relations</h2>
            </div>
            <p className="text-sm text-[#838383] mb-6">
              The ontology defines 20 object property predicates that connect technologies to one another.
            </p>
            <div className="bg-[#1b1b1b] border border-[#333333] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_2fr] text-[10px] font-mono text-[#838383] uppercase tracking-widest px-5 py-3 border-b border-[#333333] bg-[#131313]">
                <span>Predicate</span>
                <span>Domain → Range</span>
                <span>Description</span>
              </div>
              <div className="divide-y divide-[#222222]">
                {RELATIONS.map((rel) => (
                  <div key={rel.pred} className="grid grid-cols-[1fr_1fr_2fr] gap-4 px-5 py-4 hover:bg-[#222222] transition-colors">
                    <code className="text-xs font-mono text-[#b4c5ff] self-start">{rel.label}</code>
                    <div className="self-start">
                      <span className="text-[10px] font-mono text-[#c3c6d7]">{rel.domain}</span>
                      <span className="text-[10px] font-mono text-[#838383]"> → </span>
                      <span className="text-[10px] font-mono text-[#c3c6d7]">{rel.range}</span>
                    </div>
                    <p className="text-xs text-[#838383] leading-relaxed">{rel.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SPARQL Endpoint */}
          <section id="sparql">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#b4c5ff]/10 border border-[#b4c5ff]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">terminal</span>
              </div>
              <h2 className="text-xl font-headline font-bold text-[#e5e2e1]">SPARQL Endpoint</h2>
            </div>
            <div className="space-y-4 text-sm text-[#c3c6d7]">
              <p>
                SPARQL queries are executed by the <strong>built-in engine (Comunica)</strong> on the server, directly over the local ontology file — no separate server required. Apache Jena Fuseki can still be used as an option.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#1b1b1b] border border-[#333333] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">offline_bolt</span>
                    <p className="text-sm font-mono font-bold text-[#e5e2e1]">Built-in Engine (Default)</p>
                  </div>
                  <p className="text-xs text-[#838383] mb-3">Comunica runs SPARQL 1.1 directly over the local ontology, server-side.</p>
                  <code className="block text-[10px] font-mono text-[#b4c5ff] bg-[#0e0e0e] px-3 py-2 rounded-lg">
                    Comunica · ontology/webdev.ttl
                  </code>
                  <p className="text-[10px] text-[#838383] mt-2">Enabled automatically — no extra configuration.</p>
                </div>
                <div className="bg-[#1b1b1b] border border-[#333333] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">cloud</span>
                    <p className="text-sm font-mono font-bold text-[#e5e2e1]">Fuseki (Optional)</p>
                  </div>
                  <p className="text-xs text-[#838383] mb-3">Apache Jena Fuseki triplestore for a full SPARQL server.</p>
                  <code className="block text-[10px] font-mono text-[#b4c5ff] bg-[#0e0e0e] px-3 py-2 rounded-lg">
                    env: FUSEKI_ENDPOINT
                  </code>
                  <p className="text-[10px] text-[#838383] mt-2">Used when FUSEKI_ENDPOINT is set; otherwise the built-in engine is used.</p>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                <span className="material-symbols-outlined text-amber-400 text-lg mt-0.5 flex-shrink-0">tips_and_updates</span>
                <p className="text-xs text-[#c3c6d7]">
                  For production, simply deploy to Vercel — the built-in engine runs without any extra server. To use Fuseki
                  (locally: <code className="text-[#b4c5ff] mx-1">setup-fuseki.bat</code>), set the
                  <code className="text-[#b4c5ff] mx-1">FUSEKI_ENDPOINT</code> env to its endpoint URL.
                </p>
              </div>
            </div>
          </section>

          {/* Example Queries */}
          <section id="examples">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#b4c5ff]/10 border border-[#b4c5ff]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#b4c5ff] text-[18px]">code</span>
              </div>
              <h2 className="text-xl font-headline font-bold text-[#e5e2e1]">Example SPARQL Queries</h2>
            </div>
            <div className="space-y-6">
              {[
                {
                  title: "All Technologies with Their Type",
                  code: `${PREFIX_BLOCK}\n\nSELECT DISTINCT ?label ?typeLabel\nWHERE {\n  ?tech a ?type .\n  ?type rdfs:subClassOf* ex:Technology .\n  OPTIONAL { ?tech rdfs:label ?label }\n  OPTIONAL { ?type rdfs:label ?typeLabel }\n  FILTER(?type != ex:Technology)\n}\nORDER BY ?typeLabel ?label`,
                },
                {
                  title: "ORMs and Their Supported Databases",
                  code: `${PREFIX_BLOCK}\n\nSELECT ?ormLabel ?dbLabel\nWHERE {\n  ?orm a ex:ORM ;\n       ex:isORMFor ?db .\n  OPTIONAL { ?orm rdfs:label ?ormLabel }\n  OPTIONAL { ?db rdfs:label ?dbLabel }\n}\nORDER BY ?ormLabel`,
                },
                {
                  title: "Frameworks by Programming Language",
                  code: `${PREFIX_BLOCK}\n\nSELECT ?fwLabel ?langLabel\nWHERE {\n  ?fw a ex:Framework ;\n      ex:usesLanguage ?lang .\n  OPTIONAL { ?fw rdfs:label ?fwLabel }\n  OPTIONAL { ?lang rdfs:label ?langLabel }\n}\nORDER BY ?langLabel ?fwLabel`,
                },
              ].map((item) => (
                <div key={item.title} className="bg-[#1b1b1b] border border-[#333333] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[#333333] bg-[#131313]">
                    <p className="text-xs font-mono text-[#c3c6d7]">{item.title}</p>
                    <Link
                      href="/sparql"
                      className="text-[10px] font-mono text-[#b4c5ff] hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                      Try in Lab
                    </Link>
                  </div>
                  <pre className="text-xs font-mono text-[#c3c6d7] p-5 overflow-x-auto leading-relaxed bg-[#0e0e0e]">
                    {item.code}
                  </pre>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
