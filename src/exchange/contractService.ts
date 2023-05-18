import {
  address,
  ADJUST_MARGIN,
} from "../../submodules/library-sui/src";
import { OnChainCalls } from "../../submodules/library-sui/src";
import { RawSigner, SignerWithProvider, SuiTransactionBlockResponse,JsonRpcProvider } from "@mysten/sui.js";

export class ContractCalls{
  onChainCalls:OnChainCalls;
  signer:RawSigner;
  constructor(signer:RawSigner,rpc:JsonRpcProvider, deployment:any){
    this.signer = signer;
    const signerWithProvider:SignerWithProvider = this.signer.connect(rpc); 
    this.onChainCalls = new OnChainCalls(signerWithProvider, deployment);
  }
  
  withdrawFromMarginBankContractCall = async (
    amount: Number
  ):Promise<SuiTransactionBlockResponse> => {
    return await this.onChainCalls.withdrawFromBank(
      {
        amount: amount.toString(),
      },
      this.signer
    );
  };

  depositToMarginBankContractCall = async (
    amount: number,
    coinID: string,
  ): Promise<SuiTransactionBlockResponse> => {
    return await this.onChainCalls.depositToBank(
      {
        amount: amount.toString(),
        coinID: coinID
      },
      this.signer
    );
  };


  adjustLeverageContractCall = async (
    leverage:number
  ) => {
    return await this.onChainCalls.adjustLeverage(
      {
        leverage: leverage,
      },
      this.signer
    );
  };

  setSubAccount=async (
    publicAddress:address,
    status:boolean,
    gasLimit: number,
    networkName: string
  )=>{
    

  }

  adjustMarginContractCall = async (
    operationType: ADJUST_MARGIN,
    amount: number,
    gasLimit: number,
    networkName: string,
    getPublicAddress: () => address
  ) => {
    
  };    
}
