// Sets the owner's password in Supabase (first time, or if it is forgotten).
//
//   npm run set-owner-password          saves it to Supabase using .env.local
//   npm run set-owner-password -- --sql prints SQL to paste in the Supabase SQL editor
//
// Staff passwords are kept as they are.
import { existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { MIN_PASSWORD_LENGTH, ownerHashFor, ownerSetupSql, saveOwnerHash } from "@/lib/ownerSetup";
import { supabaseSecretKey, supabaseUrl } from "@/lib/supabaseAdmin";

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const mute = rl as unknown as { _writeToOutput: (text: string) => void; output: NodeJS.WriteStream };
    let prompted = false;
    mute._writeToOutput = (text: string) => {
      if (!prompted) {
        mute.output.write(text);
        prompted = true;
      }
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main() {
  const sqlOnly = process.argv.includes("--sql");
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
  if (!sqlOnly && (!supabaseUrl() || !supabaseSecretKey())) {
    console.error("SUPABASE_URL و SUPABASE_SECRET_KEY مو موجودين في .env.local.");
    console.error("أضيفيهم، أو شغّلي: npm run set-owner-password -- --sql");
    process.exit(1);
  }

  console.log(`كلمة سر المالكة الجديدة (${MIN_PASSWORD_LENGTH} أحرف على الأقل). ما بتظهر وأنتِ تكتبين.`);
  const password = await askHidden("كلمة السر: ");
  const confirm = await askHidden("أعيدي كتابتها: ");
  const result = await ownerHashFor(password, confirm);
  if (!result.ok) {
    console.error(
      result.reason === "too-short"
        ? `كلمة السر قصيرة. لازم ${MIN_PASSWORD_LENGTH} أحرف على الأقل.`
        : "الكلمتين مو نفس الشي. جربي مرة ثانية.",
    );
    process.exit(1);
  }

  if (sqlOnly) {
    console.log("\nانسخي هذا والصقيه في Supabase > SQL Editor ثم Run:\n");
    console.log(ownerSetupSql(result.hash));
    return;
  }

  await saveOwnerHash(result.hash);
  console.log("تم. ادخلي باسم «المالكة» وكلمة السر الجديدة.");
}

main().catch((error) => {
  console.error("ما قدرنا نحفظ كلمة السر:", error instanceof Error ? error.message : error);
  console.error("تأكدي إن جداول Supabase موجودة (supabase/migrations) وإن المفتاح صحيح.");
  process.exit(1);
});
