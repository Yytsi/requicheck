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

export const ensureExaltValuesArePopulated = populateExaltValues
export { exaLHSTSets, exaPointsList, bannedItems, pointPenaltyItems }
