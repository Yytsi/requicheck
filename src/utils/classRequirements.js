// lost halls discord exalted run requirements for each class
export const classRequirementLostHallsExalted = {
  warrior: 0,
  paladin: 1,
  knight: 2,
  samurai: 3,
  ninja: 2,
  kensei: 3,
  rogue: 4,
  assassin: 3,
  trickster: 2,
  archer: 4,
  huntress: 4,
  bard: 4,
  wizard: 2,
  necromancer: 3,
  mystic: 2,
  priest: 5,
  sorcerer: 3,
  summoner: 4,
}

const exaLHSTSets = []
const exaPointsList = [[], [], [], []] // 5, 3, 2, 1
const bannedItems = []
const pointPenaltyItems = []
let allGearItems = []
const itemToClassDict = {}
let reskinMap = new Map()
let exaltedValuesPromise = null

async function populateExaltValues() {
  if (exaltedValuesPromise != null) {
    return exaltedValuesPromise
  }

  exaltedValuesPromise = new Promise(async (resolve, reject) => {
    try {
      let response = await fetch(
        `${import.meta.env.BASE_URL}data/lh_exa_sets.txt`
      )
      let text = await response.text()
      let lines = text.split('\n')
      for (let line of lines) {
        let trimmedLine = line.trim()
        if (trimmedLine) {
          exaLHSTSets.push(trimmedLine.split(' '))
        }
      }

      response = await fetch(`${import.meta.env.BASE_URL}data/banned.txt`)
      text = await response.text()
      lines = text.split('\n')
      for (let line of lines) {
        let trimmedLine = line.trim()
        if (trimmedLine) {
          bannedItems.push(trimmedLine)
        }
      }

      response = await fetch(`${import.meta.env.BASE_URL}data/t11_items.txt`)
      text = await response.text()
      lines = text.split('\n')
      for (let line of lines) {
        let trimmedLine = line.trim()
        if (trimmedLine) {
          pointPenaltyItems.push(trimmedLine)
        }
      }

      let idx = 0
      for (let num of [5, 3, 2, 1]) {
        response = await fetch(
          `${import.meta.env.BASE_URL}data/points_items${num}.txt`
        )
        text = await response.text()
        lines = text.split('\n')

        for (let line of lines) {
          let trimmedLine = line.trim()
          if (trimmedLine) {
            exaPointsList[idx].push(trimmedLine.split(' '))
          }
        }

        idx++
      }

      response = await fetch(
        `${import.meta.env.BASE_URL}equipment_with_classes.txt`
      )
      text = await response.text()
      let itemClassDict = {}
      lines = text.split('\n')
      const parsedItems = lines.reduce((acc, line) => {
        const trimmedLine = line.trim()

        if (trimmedLine) {
          const parts = trimmedLine.split(' ^ ')
          if (parts.length === 5) {
            const [imgSrc, name, link, category, characterClass] = parts
            const imageName = link.replace('/wiki/', '') + '.png'
            itemClassDict[imageName.replace('.png', '')] = characterClass
            const id = `${name}-${link}` // create a unique ID for each item (caution: this may not be unique in all cases so remove duplicates if necessary)
            acc.push({
              id,
              imgSrc,
              name,
              imageLocalPath: `downloaded_images/${imageName}`,
              weaponLinkName: imageName.replace('.png', ''),
              category,
              characterClass,
              link,
            })
          } else {
            console.warn('Skipping line due to incorrect format:', line)
          }
        }
        return acc
      }, [])
      allGearItems = parsedItems
      Object.assign(itemToClassDict, itemClassDict)

      response = await fetch(`${import.meta.env.BASE_URL}reskins.txt`)
      text = await response.text()
      lines = text.split('\n')

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine) {
          const [reskin, originalItem] = trimmedLine.split(' ^ ')
          reskinMap.set(reskin, originalItem)
        }
      }

      resolve()
    } catch (error) {
      console.error('Error fetching or parsing the file:', error)
      reject(error)
    } finally {
      exaltedValuesPromise = null
    }
  })

  return exaltedValuesPromise
}

const removeReskin = (item) => {
  return reskinMap.get(item) || item
}

export const ensureExaltValuesArePopulated = populateExaltValues
export {
  exaLHSTSets,
  exaPointsList,
  bannedItems,
  pointPenaltyItems,
  allGearItems,
  itemToClassDict,
  reskinMap,
  removeReskin,
}
