import type { BlockType } from '../types';

/** Messages d'erreur backend plus clairs selon le type de source. */
export function formatSourceImportError(blockType: BlockType, message: string): string {
  let msg = message.trim();
  if (blockType === 'sql') {
    msg = msg.replace(/Fichier CSV invalide/gi, 'Fichier SQL invalide');
    if (/no such table|table.*n'existe pas/i.test(msg)) {
      msg += ' — Utilisez CREATE TABLE + INSERT dans le fichier, ou importez data/transactions.sql.';
    }
  }
  return msg;
}
