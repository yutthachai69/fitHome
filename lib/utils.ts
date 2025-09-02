export function calcBMI(weightKg: number, heightCm?: number) {
  if (!heightCm || heightCm <= 0) return null
  const h = heightCm / 100
  return +(weightKg / (h * h)).toFixed(1)
}

export function weeklyTargetRate(startKg: number, targetKg: number, weeks?: number) {
  if (!weeks || weeks <= 0) return null
  return +((startKg - targetKg) / weeks).toFixed(2) // kg/week ที่ควรลด
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('th-TH')
}

export function formatWeight(weight: number) {
  return `${weight} กก.`
}

