import { ModuleProvider, Modules } from "@medusajs/utils";
import SenangPayServiceProvider from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [SenangPayServiceProvider],
});
