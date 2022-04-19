import { UniswapV2 } from './uniswap-v2';
import { Network } from '../../constants';
import { Address, DexConfigMap } from '../../types';
import { IDexHelper } from '../../dex-helper/index';
import { Interface } from '@ethersproject/abi';
import { DexParams } from './types';
import excaliburPoolABI from '../../abi/uniswap-v2/excalibur-pool.json';
import { getDexKeysWithNetwork } from '../../utils';

export const ExcaliburConfig: DexConfigMap<DexParams> = {
  Excalibur: {
    [Network.FANTOM]: {
      factoryAddress: '0x08b3CCa975a82cFA6f912E0eeDdE53A629770D3f',
      feeCode: 0, // this is ingored as Excalibur uses dynamic fees
    },
  },
};

export class Excalibur extends UniswapV2 {
  excaliburPool: Interface;

  public static dexKeysWithNetwork: { key: string; networks: Network[] }[] =
    getDexKeysWithNetwork(ExcaliburConfig);

  constructor(
    protected network: Network,
    protected dexKey: string,
    protected dexHelper: IDexHelper,
  ) {
    super(
      network,
      dexKey,
      dexHelper,
      true,
      ExcaliburConfig[dexKey][network].factoryAddress,
      ExcaliburConfig[dexKey][network].subgraphURL,
      ExcaliburConfig[dexKey][network].feeCode,
    );
    this.excaliburPool = new Interface(excaliburPoolABI);
  }

  protected getFeesMultiCallData(poolAddress: Address) {
    const callEntry = {
      target: poolAddress,
      callData: this.excaliburPool.encodeFunctionData('feeAmount', []),
    };
    const callDecoder = (values: any[]) =>
      Math.ceil(
        parseInt(
          this.excaliburPool
            .decodeFunctionResult('feeAmount', values)[0]
            .toString(),
        ) / 10,
      );
    return {
      callEntry,
      callDecoder,
    };
  }
}