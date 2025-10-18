import type { EffectDescriptor, EffectPreset } from '../types'

export function createDefaultEffectDescriptors(): EffectDescriptor[] {
  return [
    {
      id: 'reverb',
      label: 'Hall Reverb',
      description: '模拟音乐厅空间混响',
      active: false,
      order: 1
    },
    {
      id: 'compressor',
      label: 'Soft Compressor',
      description: '动态压缩，平衡强弱',
      active: false,
      order: 2
    },
    {
      id: 'equalizer',
      label: 'Warm EQ',
      description: '三段均衡优化',
      active: false,
      order: 3
    }
  ]
}

export function createDefaultEffectPresets(): EffectPreset[] {
  return [
    {
      id: 'studio',
      name: '录音棚模式',
      description: '轻度混响 + 压缩，适合练习录音',
      applies: {
        reverb: true,
        compressor: true,
        equalizer: false
      }
    },
    {
      id: 'concert',
      name: '音乐会模式',
      description: '打开全部效果，呈现舞台感',
      applies: {
        reverb: true,
        compressor: true,
        equalizer: true
      }
    },
    {
      id: 'raw',
      name: '纯净钢琴',
      description: '关闭效果器，保持原汁原味',
      applies: {
        reverb: false,
        compressor: false,
        equalizer: false
      }
    }
  ]
}
