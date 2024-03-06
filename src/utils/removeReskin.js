const reskinMap = new Map()

fetch(`${import.meta.env.BASE_URL}reskins.txt`)
  .then((response) => response.text())
  .then((text) => {
    const lines = text.split('\n')
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine) {
        const [reskin, originalItem] = trimmedLine.split(' ^ ')
        reskinMap.set(reskin, originalItem)
      }
    }
  })
  .catch((error) => console.error('Error fetching or parsing the file:', error))

export const removeReskin = (item) => {
  return reskinMap.get(item) || item
}
