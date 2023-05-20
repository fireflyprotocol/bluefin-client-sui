import { address, ADJUST_MARGIN } from "../../submodules/library-sui/src";
import { OnChainCalls } from "../../submodules/library-sui/src";
import { RawSigner, SignerWithProvider, JsonRpcProvider } from "@mysten/sui.js";
import {
  ResponseSchema,
  SuccessMessages,
  TransformToResponseSchema,
} from "./contractErrorHandling.service";
import { default as interpolate } from "interpolate";

export class ContractCalls {
  onChainCalls: OnChainCalls;
  signer: RawSigner;
  constructor(signer: RawSigner, rpc: JsonRpcProvider, deployment: any) {
    this.signer = signer;
    const signerWithProvider: SignerWithProvider = this.signer.connect(rpc);
    this.onChainCalls = new OnChainCalls(signerWithProvider, deployment);
  }

  withdrawFromMarginBankContractCall = async (
    amount: Number
  ): Promise<ResponseSchema> => {
    return TransformToResponseSchema(async () => {
      return await this.onChainCalls.withdrawFromBank(
        {
          amount: amount.toString(),
        },
        this.signer
      );
    }, interpolate(SuccessMessages.withdrawMargin, { amount }));
  };

  depositToMarginBankContractCall = async (
    amount: number,
    coinID: string
  ): Promise<ResponseSchema> => {
    return TransformToResponseSchema(async () => {
      return await this.onChainCalls.depositToBank(
        {
          amount: amount.toString(),
          coinID: coinID,
          bankID: this.onChainCalls.getBankID(),
          accountAddress: await this.signer.getAddress(),
        },
        this.signer
      );
    }, interpolate(SuccessMessages.depositToBank, { amount }));
  };

  adjustLeverageContractCall = async (
    leverage: number,
    symbol: string,
    parentAddress?: string
  ) => {
    const perpId = this.onChainCalls.getPerpetualID(symbol);
    return TransformToResponseSchema(async () => {
      return await this.onChainCalls.adjustLeverage(
        {
          leverage: leverage,
          perpID: perpId,
          account: parentAddress
            ? parentAddress
            : await this.signer.getAddress(),
        },
        this.signer
      );
    }, interpolate(SuccessMessages.adjustLeverage, { leverage }));
  };

  setSubAccount = async (
    publicAddress: address,
    status: boolean,
    gasLimit?: number
  ): Promise<ResponseSchema> => {
    return TransformToResponseSchema(async () => {
      return await this.onChainCalls.setSubAccount(
        {
          account: publicAddress,
          status: status,
          gasBudget: gasLimit,
        },
        this.signer
      );
    }, interpolate(SuccessMessages.setSubAccounts, { publicAddress: publicAddress, status: status ? "added" : "removed" }));
  };

  adjustMarginContractCall = async (
    symbol: string,
    operationType: ADJUST_MARGIN,
    amount: number,
    gasLimit?: number
  ) => {
    const perpId = this.onChainCalls.getPerpetualID(symbol);
    const msg =
      operationType == ADJUST_MARGIN.Add
        ? interpolate(SuccessMessages.adjustMarginAdd, { amount })
        : interpolate(SuccessMessages.adjustMarginRemove, { amount });
    return TransformToResponseSchema(async () => {
      if (operationType == ADJUST_MARGIN.Add) {
        return await this.onChainCalls.addMargin(
          {
            amount: amount,
            perpID: perpId,
            gasBudget: gasLimit,
          },
          this.signer
        );
      } else {
        return await this.onChainCalls.removeMargin(
          {
            amount: amount,
            gasBudget: gasLimit,
            perpID: perpId,
          },
          this.signer
        );
      }
    }, msg);
  };
}
