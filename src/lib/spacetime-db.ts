// Zde upravte import a inicializaci klienta, správná syntaxe závisí na konkrétní verzi SDK
import * as SpaceTimeDB from '@clockworklabs/spacetimedb-sdk';

// Předpokládáme správnou strukturu importů podle aktuální verze knihovny
export const spaceTimeDBClient = new SpaceTimeDB.SpaceTimeDBClient({
  host: 'localhost',
  port: 3000,
  ssl: false,
});

export const connectToSpaceTimeDB = async () => {
  try {
    await spaceTimeDBClient.connect();
    console.log('Connected to SpaceTimeDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to SpaceTimeDB:', error);
    return false;
  }
};
