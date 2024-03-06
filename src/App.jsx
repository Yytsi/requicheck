import React, { useState, useEffect, useMemo } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'

import { removeReskin } from './utils/removeReskin'
import {
  classRequirementLostHallsExalted,
  ensureExaltValuesArePopulated, // due to async function
  exaLHSTSets,
  exaPointsList,
  bannedItems,
  pointPenaltyItems,
} from './utils/classRequirements'

function App() {
  const [items, setItems] = useState([])
  const [selectedWeapon, setSelectedWeapon] = useState(null)
  const [selectedAbility, setSelectedAbility] = useState(null)
  const [selectedArmor, setSelectedArmor] = useState(null)
  const [selectedRing, setSelectedRing] = useState(null)
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  const itemTypes = useMemo(() => {
    if (items.length > 0) {
      const itemTypeMap = new Map()
      for (let item of items) {
        if (item.category) {
          itemTypeMap.set(item.weaponLinkName, Number(item.category))
        }
      }
      return itemTypeMap
    }
    return new Map()
  }, [items])

  const skinlessWeapon = useMemo(() => {
    if (selectedWeapon !== null) {
      return removeReskin(selectedWeapon.weaponLinkName)
    }
  }, [selectedWeapon])
  const skinlessAbility = useMemo(() => {
    if (selectedAbility !== null) {
      return removeReskin(selectedAbility.weaponLinkName)
    }
  }, [selectedAbility])
  const skinlessArmor = useMemo(() => {
    if (selectedArmor !== null) {
      return removeReskin(selectedArmor.weaponLinkName)
    }
  }, [selectedArmor])
  const skinlessRing = useMemo(() => {
    if (selectedRing !== null) {
      return removeReskin(selectedRing.weaponLinkName)
    }
  }, [selectedRing])

  const hasItem = (item) => {
    if (item === null) return -2
    if (selectedWeapon && skinlessWeapon === item) return 0
    if (selectedAbility && skinlessAbility === item) return 1
    if (selectedArmor && skinlessArmor === item) return 2
    if (selectedRing && skinlessRing === item) return 3
    return -1
  }

  const characterPoints = useMemo(() => {
    async function populateExaltValues() {
      await ensureExaltValuesArePopulated()
    }
    populateExaltValues()

    for (let i = 0; i < 4; i++) {
      if (
        bannedItems.includes(
          [skinlessWeapon, skinlessAbility, skinlessArmor, skinlessRing][i]
        )
      ) {
        return -1 * (i + 1) * 10
      }
    }

    // check st sets first
    for (let set of exaLHSTSets) {
      if (
        set.includes(skinlessWeapon) &&
        set.includes(skinlessAbility) &&
        set.includes(skinlessArmor) &&
        set.includes(skinlessRing)
      ) {
        return 99
      }
    }

    const pointsAssignedEquipment = [false, false, false, false]
    let totalPoints = 0

    // check for exalted items
    for (let i = 0; i < 4; i++) {
      for (let item of exaPointsList[i]) {
        // staff-of-the-fundamental-core
        // special 3 item:healing-tome item:ritual-robe item:the-twilight-gemstone
        if (item[0] === 'special') {
          const cnt = Number(item[1])
          const rest = item.slice(2)
          let ok = true

          for (let req of rest) {
            const [a, b] = req.split(':')
            if (a === 'item') {
              const itemType = itemTypes.get(b) - 1
              if (hasItem(b) == -1 || pointsAssignedEquipment[itemType]) {
                ok = false
                break
              }
            } else if (a === 'class') {
              if (b !== selectedCharacter) {
                ok = false
                break
              }
            } else {
              console.log('Unknown special requirement:', req)
            }
          }

          if (ok) {
            for (let req of rest) {
              const [a, b] = req.split(':')
              if (a === 'item') {
                const itemType = itemTypes.get(b) - 1
                pointsAssignedEquipment[itemType] = true
              }
            }

            totalPoints += [5, 3, 2, 1][i]
          }
        } else {
          const it = item[0]
          const itemType = itemTypes.get(it) - 1

          if (hasItem(it) == -1 || pointsAssignedEquipment[itemType]) {
            continue
          }

          pointsAssignedEquipment[itemType] = true
          totalPoints += [5, 3, 2, 1][i]
        }
      }
    }

    // check for point penalty items
    for (let item of pointPenaltyItems) {
      if (hasItem(item) >= 0) {
        totalPoints--
      }
    }

    return totalPoints
  }, [selectedWeapon, selectedAbility, selectedArmor, selectedRing])

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}equipment_with_classes.txt`)
      .then((response) => response.text())
      .then((text) => {
        const lines = text.split('\n')
        const parsedItems = lines.reduce((acc, line) => {
          const trimmedLine = line.trim()

          if (trimmedLine) {
            const parts = trimmedLine.split(' ^ ')
            if (parts.length === 5) {
              const [imgSrc, name, link, category, characterClass] = parts
              const imageName = link.replace('/wiki/', '') + '.png'
              const id = `${name}-${link}` // create a unique ID for each item
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
        setItems(parsedItems)
      })
      .catch((error) =>
        console.error('Error fetching or parsing the file:', error)
      )
  }, [])

  const selectItem = (item) => {
    if (!item) return
    switch (item.category) {
      case '1':
        setSelectedWeapon(item)
        break
      case '2':
        setSelectedAbility(item)
        setSelectedCharacter(item.characterClass)
        console.log(item.characterClass)
        break
      case '3':
        setSelectedArmor(item)
        break
      case '4':
        setSelectedRing(item)
        break
      default:
        console.warn('Unknown category:', item.category)
    }
  }

  const customFilter = (options, { inputValue }) => {
    const words = inputValue
      .toLowerCase()
      .split(' ')
      .filter((word) => word.length > 0)

    return options.filter((option) => {
      return words.every((word) => option.name.toLowerCase().includes(word))
    })
  }

  const middleBox = () => {
    if (characterPoints < -1) {
      console.log('characterPoints:', characterPoints)
      let bannedItem = ''
      switch (characterPoints) {
        case -10:
          bannedItem = selectedWeapon.name
          break
        case -20:
          bannedItem = selectedAbility.name
          break
        case -30:
          bannedItem = selectedArmor.name
          break
        case -40:
          bannedItem = selectedRing.name
          break
        default:
          bannedItem = 'Unknown'
      }
      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            maxWidth: '800px',
            margin: 'auto',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            <span style={{ color: 'red' }}>
              {bannedItem} is banned from an exalted lost halls run
            </span>
          </Typography>
        </Paper>
      )
    } else if (!selectedCharacter) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            maxWidth: '800px',
            margin: 'auto',
            textAlign: 'center',
          }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            <span style={{ color: 'red' }}>
              Currently {characterPoints} points for an exalted lost halls run
              (no class selected)
            </span>
          </Typography>
        </Paper>
      )
    } else if (selectedCharacter) {
      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            maxWidth: '800px',
            margin: 'auto',
            textAlign: 'center',
          }}
        >
          {classRequirementLostHallsExalted[selectedCharacter] <=
          characterPoints ? (
            <Typography variant="h5" component="h2" gutterBottom>
              {characterPoints < 99 ? (
                <span style={{ color: 'green' }}>
                  Your
                  <img
                    src={`class_pictures/${selectedCharacter}.png`}
                    style={{
                      maxWidth: '50px',
                      maxHeight: '50px',
                      margin: '0 10px',
                    }}
                  />
                  has {characterPoints}/
                  {classRequirementLostHallsExalted[selectedCharacter]} points
                  for an exalted lost halls run :){' '}
                </span>
              ) : (
                <span style={{ color: 'green' }}>
                  Your
                  <img
                    src={`class_pictures/${selectedCharacter}.png`}
                    style={{
                      maxWidth: '50px',
                      maxHeight: '50px',
                      margin: '0 10px',
                    }} // Controlled size
                  />
                  has an accepted ST Set for the run! :){' '}
                </span>
              )}
            </Typography>
          ) : (
            <Typography variant="h5" component="h2" gutterBottom>
              <span style={{ color: 'red' }}>
                Your
                <img
                  src={`class_pictures/${selectedCharacter}.png`}
                  style={{
                    maxWidth: '50px',
                    maxHeight: '50px',
                    margin: '0 10px',
                  }}
                />
                has {characterPoints}/
                {classRequirementLostHallsExalted[selectedCharacter]} points for
                an exalted lost halls run :({' '}
              </span>
            </Typography>
          )}
        </Paper>
      )
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: '100%',
          p: 2,
          backgroundColor: '#006400',
          color: 'white',
        }}
      >
        <Typography variant="h4" component="h1" textAlign="center">
          Rotmg Raid Requirement Checker
        </Typography>
      </Box>

      {/* Service Description Section */}
      <Box
        sx={{
          width: '100%',
          mt: 4,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{ p: 3, maxWidth: '800px', margin: 'auto', textAlign: 'center' }}
        >
          <Typography variant="h5" component="h2" gutterBottom>
            Do you have the gear for that LH exalted raid? Find out!
          </Typography>
          <Typography variant="body1" paragraph>
            Enter your gear by using the search bar below and see if you have
            the right gear for your character.
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          width: '100%',
          mt: 2,
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {middleBox()}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: 300, marginBottom: 4 }}>
          <Autocomplete
            options={items}
            getOptionLabel={(option) => option.name}
            filterOptions={customFilter}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <img
                  src={option.imageLocalPath}
                  alt={option.name}
                  style={{ width: 20, height: 20, marginRight: 10 }}
                />
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Search Items" variant="outlined" />
            )}
            onChange={(event, newValue) => {
              selectItem(newValue)
            }}
            fullWidth
          />
        </Box>

        <Grid container justifyContent="center" spacing={2}>
          <Grid item>
            <img
              src={
                selectedWeapon
                  ? selectedWeapon.imageLocalPath
                  : `${import.meta.env.BASE_URL}gifs/weapon.gif`
              }
              alt="First"
            />
          </Grid>
          <Grid item>
            <img
              src={
                selectedAbility
                  ? selectedAbility.imageLocalPath
                  : `${import.meta.env.BASE_URL}gifs/ability.gif`
              }
              alt="Second"
            />
          </Grid>
          <Grid item>
            <img
              src={
                selectedArmor
                  ? selectedArmor.imageLocalPath
                  : `${import.meta.env.BASE_URL}/gifs/armor.gif`
              }
              alt="Third"
            />
          </Grid>
          <Grid item>
            <img
              src={
                selectedRing
                  ? selectedRing.imageLocalPath
                  : `${import.meta.env.BASE_URL}ring.png`
              }
              alt="Fourth"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          width: '100%',
          p: 2,
          backgroundColor: '#e0e0e0', // A light grey background for the footer
          borderTop: '1px solid #bdbdbd', // A subtle border line at the top of the footer for separation
          mt: 'auto', // Push the footer to the bottom
        }}
      >
        <Typography variant="body2" textAlign="center" color="textSecondary">
          This app is not endorsed or affiliated with Realm of the Mad God, Deca
          Games, or any related entities. All images, data, and content related
          to Realm of the Mad God used in this app are property of their
          respective owners. This app is intended for educational and
          informational purposes only, under fair use guidelines.
          <br />
          Hosted on{' '}
          <a
            href="https://pages.github.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit' }}
          >
            GitHub Pages
          </a>
          .
        </Typography>
      </Box>
    </Box>
  )
}

export default App
