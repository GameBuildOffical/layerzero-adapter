import 'hardhat/types/config'

interface OftAdapterConfig {
    tokenAddress: string
}

declare module 'hardhat/types/config' {
    interface HardhatNetworkUserConfig {
        oftAdapter?: never,
        token?: never,
        toEid?: never
    }

    interface HardhatNetworkConfig {
        oftAdapter?: never,
        token?: never
        toEid?: never
    }

    interface HttpNetworkUserConfig {
        oftAdapter?: OftAdapterConfig,
        token?: OftAdapterConfig,
        toEid?: never
    }

    interface HttpNetworkConfig {
        oftAdapter?: OftAdapterConfig,
        token?: OftAdapterConfig,
        toEid?: never
    }
}
