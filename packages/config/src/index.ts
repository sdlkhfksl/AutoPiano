import notes, { NotesMap } from './legacy/notes'
import lyrics from './legacy/lyrics'
import wallpaper from './legacy/wallpaper'
import links from './legacy/links'
import goods from './legacy/goods'
import ScoreNum from './legacy/scorenum'

export const Notes = notes
export const NotesMapping = NotesMap
export type NoteDefinition = typeof notes[number]

export const Lyrics = lyrics
export type LyricLine = typeof lyrics[number]

export const Wallpaper = wallpaper
export type WallpaperPath = typeof wallpaper[number]

export const Links = links
export type FriendLink = typeof links[number]

export const Goods = goods
export type GoodsItem = typeof goods[number]

export const ScoreNumbered = ScoreNum
export type NumberedScore = typeof ScoreNum[number]
