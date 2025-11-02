import { Zap, Shield, Globe, Code, Layers, Infinity } from 'lucide-react'

const iconMap = {
  Zap,
  Shield,
  Globe,
  Code,
  Layers,
  Infinity,
}

export function getIconByName(name) {
  const Cmp = iconMap[name] || Zap
  return Cmp
}


