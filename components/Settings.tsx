import SettingsClient from "@/components/SettingsClient";
import { getConfig } from "@/lib/config";

export default async function Settings() {
  const config = await getConfig();

  return <SettingsClient config={config} />;
}
