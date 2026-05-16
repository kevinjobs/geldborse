"use client"

import Image from "next/image"

interface LogoProps {
  size?: number
  className?: string
}

const BASE_PATH = "/icons/"

export const AlipayLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}alipay.svg`} alt="支付宝" width={size} height={size} className={className} />
)

export const WechatLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}微信.svg`} alt="微信" width={size} height={size} className={className} />
)

export const ABCBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}农业银行.svg`} alt="农业银行" width={size} height={size} className={className} />
)

export const CMBBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}CMB.svg`} alt="招商银行" width={size} height={size} className={className} />
)

export const CCBBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}CCB.svg`} alt="建设银行" width={size} height={size} className={className} />
)

export const CEBBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}CEB.svg`} alt="光大银行" width={size} height={size} className={className} />
)

export const CITICBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}CITIC.svg`} alt="中信银行" width={size} height={size} className={className} />
)

export const CMBChinaBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}民生银行.svg`} alt="民生银行" width={size} height={size} className={className} />
)

export const BOCBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}银行-中国银行.svg`} alt="中国银行" width={size} height={size} className={className} />
)

export const BOCOMBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}COMM.svg`} alt="交通银行" width={size} height={size} className={className} />
)

export const HXBBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}华夏银行.svg`} alt="华夏银行" width={size} height={size} className={className} />
)

export const NJCBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}南京银行.svg`} alt="南京银行" width={size} height={size} className={className} />
)

export const PSBCBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}PSBC.svg`} alt="邮储银行" width={size} height={size} className={className} />
)

export const ICBCBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}bank-icbc.svg`} alt="工商银行" width={size} height={size} className={className} />
)

export const CITICSecuritiesLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}中信证券.svg`} alt="中信证券" width={size} height={size} className={className} />
)

export const WebankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}微众银行.svg`} alt="微众银行" width={size} height={size} className={className} />
)

export const JdLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}京东.svg`} alt="京东" width={size} height={size} className={className} />
)

export const UnionPayLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}云闪付支付.svg`} alt="云闪付" width={size} height={size} className={className} />
)

export const DigitalRmbLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}数字人民币.svg`} alt="数字人民币" width={size} height={size} className={className} />
)

export const TaobaoLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}淘宝.svg`} alt="淘宝" width={size} height={size} className={className} />
)

export const PinduoduoLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}拼多多.svg`} alt="拼多多" width={size} height={size} className={className} />
)

export const MeituanLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}美团.svg`} alt="美团" width={size} height={size} className={className} />
)

export const SPDBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" className={className}>
    <path
      fill="currentColor"
      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m200 448H312v-64h400v64z m0-160H312v-64h400v64z"
    />
  </svg>
)

export const PABBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" className={className}>
    <path
      fill="currentColor"
      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m240 448H272v-64h480v64z m0-160H272v-64h480v64z"
    />
  </svg>
)

export const CIBBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" className={className}>
    <path
      fill="currentColor"
      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m250 448H262v-64h500v64z m0-160H262v-64h500v64z"
    />
  </svg>
)

export const GFDBankLogo = ({ size = 24, className = "" }: LogoProps) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" className={className}>
    <path
      fill="currentColor"
      d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z m220 448H292v-64h440v64z m0-160H292v-64h440v64z"
    />
  </svg>
)

export const DebtClaimLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}债权.svg`} alt="债权" width={size} height={size} className={className} />
)

export const OtherLogo = ({ size = 24, className = "" }: LogoProps) => (
  <Image src={`${BASE_PATH}其他.svg`} alt="其他" width={size} height={size} className={className} />
)

export const ACCOUNT_LOGOS: Record<string, React.ComponentType<LogoProps>> = {
  "支付宝": AlipayLogo,
  "微信": WechatLogo,
  "微信支付": WechatLogo,
  "京东": JdLogo,
  "京东金融": JdLogo,
  "云闪付": UnionPayLogo,
  "数字人民币": DigitalRmbLogo,
  "淘宝": TaobaoLogo,
  "拼多多": PinduoduoLogo,
  "美团": MeituanLogo,
  "中信银行": CITICBankLogo,
  "中信证券": CITICSecuritiesLogo,
  "招商银行": CMBBankLogo,
  "工商银行": ICBCBankLogo,
  "建设银行": CCBBankLogo,
  "农业银行": ABCBankLogo,
  "中国银行": BOCBankLogo,
  "交通银行": BOCOMBankLogo,
  "浦发银行": SPDBankLogo,
  "民生银行": CMBChinaBankLogo,
  "光大银行": CEBBankLogo,
  "平安银行": PABBankLogo,
  "兴业银行": CIBBankLogo,
  "华夏银行": HXBBankLogo,
  "广发银行": GFDBankLogo,
  "邮储银行": PSBCBankLogo,
  "南京银行": NJCBankLogo,
  "微众银行": WebankLogo,
  "债权": DebtClaimLogo,
  "其他": OtherLogo,
}

export const getAccountLogo = (name: string): React.ComponentType<LogoProps> | null => {
  return ACCOUNT_LOGOS[name] || null
}
