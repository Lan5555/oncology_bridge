const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.join(__dirname, "..");
const serviceRoot = path.join(root, "src/app/services");
const parse = (file) => ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
const compact = (text) => text.replace(/\s+/g, " ").replaceAll("|", "\\|");
const rows = [];
const methods = { get: "GET", send: "POST", update: "PATCH", put: "PUT", delete: "DELETE" };
function scan(file) {
  const source = parse(file);
  function visit(node, method = "") {
    if (ts.isMethodDeclaration(node)) method = node.name.getText(source);
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const receiver = node.expression.expression.getText(source);
      const name = node.expression.name.text;
      if (["this", "super"].includes(receiver) && methods[name] && node.arguments[0]) {
        rows.push(`| ${path.relative(serviceRoot, file).replaceAll("\\", "/")} : ${method} | ${methods[name]} | \`${compact(node.arguments[0].getText(source))}\` |`);
      }
    }
    node.forEachChild((child) => visit(child, method));
  }
  visit(source);
}
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".ts") && entry.name !== "api-routes.ts") scan(file);
  }
}
walk(serviceRoot);
const routes = parse(path.join(serviceRoot, "api-routes.ts"));
const definitions = [];
for (const node of routes.statements) {
  if (ts.isClassDeclaration(node) && node.name?.text === "Routes") {
    for (const member of node.members) {
      if (ts.isPropertyDeclaration(member) && member.initializer) definitions.push(`| \`${member.name.getText(routes)}\` | \`${compact(member.initializer.getText(routes))}\` |`);
    }
  }
}
fs.writeFileSync(path.join(root, "API_ENDPOINT_INVENTORY.md"), `# Frontend API endpoint inventory\n\nGenerated with \`node scripts/generate-api-inventory.cjs\`. This inventories client references, not backend implementation or deployment status. See [API_GAPS_BACKEND_CONTRACT.md](API_GAPS_BACKEND_CONTRACT.md) for the newly integrated gaps and exact response schemas. No authenticated production requests were made to establish server availability.\n\n## Service calls\n\n| Service and method | HTTP | Endpoint expression |\n| --- | --- | --- |\n${rows.join("\n")}\n\nThe cold-chain hook also uses authenticated GET \`/api/coldchain/stream\` with an SSE response. Admin record pages use the endpoint definitions in \`src/app/services/admin-service/admin-resources.ts\`; these include \`/admin/api/marketplace/listings\`. Shared REST session refresh sends POST \`/auth/api/refresh\`. All server implementations remain unverified from this frontend repository.\n\n## Route definitions\n\nFunction arguments correspond to the calling method above. \`id()\` URL-encodes path IDs and \`query()\` omits empty query values.\n\n| Symbol | Definition |\n| --- | --- |\n${definitions.join("\n")}\n`);
console.log(`Wrote API_ENDPOINT_INVENTORY.md (${rows.length} service calls, ${definitions.length} route definitions).`);
