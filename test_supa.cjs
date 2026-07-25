const { createClient } = require("@supabase/supabase-js");
const supabase = createClient("https://lwaznzwyqxuttgjotkzr.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3YXpuend5cXh1dHRnam90a3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTA0MDAwMH0.placeholder");

async function run() {
  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);
    console.log("Data:", data, "Error:", error);
  } catch (e) {
    console.error("Caught:", e);
  }
}
run();
