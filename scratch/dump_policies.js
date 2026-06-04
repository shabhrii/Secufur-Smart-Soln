const { execSync } = require("child_process");

try {
  const output = execSync("npx supabase db psql -c \"SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check FROM pg_policies;\"", { encoding: "utf8" });
  console.log(output);
} catch (error) {
  console.error("Error executing psql:", error.stdout || error.message);
}
