import { 
  Zap, Shield, Globe, Code, Layers, Infinity,
  Book, FileText, Video, Download, Users,
  Target, Lightbulb, Heart, Award
} from 'lucide-react'

const iconMap = {
  Zap,
  Shield,
  Globe,
  Code,
  Layers,
  Infinity,
  Book,
  FileText,
  Video,
  Download,
  Users,
  Target,
  Lightbulb,
  Heart,
  Award,
}

export function getIconByName(name) {
  const Cmp = iconMap[name] || Zap
  return Cmp
}


