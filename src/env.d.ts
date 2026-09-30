declare namespace App {
  interface Locals {
    /** Présent sur les routes d'administration, une fois l'accès Cloudflare vérifié. */
    admin?: { email: string };
  }
}
