import { PreRenderedAsset } from '../@types/viteBuild'

export const generateAssetsBuildPaths = (chunk: PreRenderedAsset) => {
  const name = chunk?.name
  const isCSS = name && /\.css$/.test(name)
  const isSVG = name && /\.svg$/.test(name)
  const isFont = name && /\.(ttf|woff|woff2|eot)$/.test(name)
  const isImage = name && /\.(png|jpg|gif|jpeg|ico)$/.test(name)

  if (isCSS) return 'css/[name].[hash].css'
  if (isSVG) return 'icons/[name].[hash].svg'
  if (isFont) return 'fonts/[name].[hash].[extname]'
  if (isImage) return 'images/[name].[hash].[extname]'

  return '[ext]/[name].[hash].[extname]'
}
