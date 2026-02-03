import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { IDL, PROGRAM_ID } from './idl';

export function getProgram(connection: web3.Connection, wallet: any) {
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  
  return new Program(IDL, PROGRAM_ID, provider);
}

export function getMarketPDA(marketId: string) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from('market'), Buffer.from(marketId)],
    new web3.PublicKey(PROGRAM_ID)
  );
}

export function getBetPDA(marketPDA: web3.PublicKey, user: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), marketPDA.toBuffer(), user.toBuffer()],
    new web3.PublicKey(PROGRAM_ID)
  );
}
