import type { ScoreMetadata, ScoreValidationIssue } from '../types'
import { NoteValidator } from './NoteValidator'

export class ScoreValidator {
  static validate(score: ScoreMetadata): ScoreValidationIssue[] {
    const issues: ScoreValidationIssue[] = []

    if (!score.name.trim()) {
      issues.push({ type: 'error', message: '曲目名称不能为空' })
    }

    if (!Array.isArray(score.mainTrack) || score.mainTrack.length === 0) {
      issues.push({ type: 'error', message: '主旋律不能为空' })
    }

    score.mainTrack.forEach((symbol, index) => {
      if (!NoteValidator.isValidSymbol(symbol)) {
        issues.push({
          type: 'warning',
          message: `主旋律第 ${index + 1} 个符号 "${symbol}" 可能不合法`,
          index
        })
      }
    })

    if (score.backingTrack) {
      score.backingTrack.forEach((symbol, index) => {
        if (!NoteValidator.isValidSymbol(symbol)) {
          issues.push({
            type: 'warning',
            message: `伴奏第 ${index + 1} 个符号 "${symbol}" 可能不合法`,
            index
          })
        }
      })
    }

    return issues
  }
}
