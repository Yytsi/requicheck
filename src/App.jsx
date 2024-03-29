import React, { useState, useEffect, useMemo } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

import { removeReskin } from './utils/removeReskin'
import {
  classRequirementLostHallsExalted,
  ensureExaltValuesArePopulated, // due to async function
  exaLHSTSets,
  exaPointsList,
  bannedItems,
  pointPenaltyItems,
} from './utils/classRequirements'

function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

function App() {
  const [items, setItems] = useState([])
  const [selectedWeapon, setSelectedWeapon] = useState(null)
  const [selectedAbility, setSelectedAbility] = useState(null)
  const [selectedArmor, setSelectedArmor] = useState(null)
  const [selectedRing, setSelectedRing] = useState(null)
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

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

  const skinlessWeapon = useMemo(
    () => removeReskin(selectedWeapon?.weaponLinkName),
    [selectedWeapon]
  )
  const skinlessAbility = useMemo(
    () => removeReskin(selectedAbility?.weaponLinkName),
    [selectedAbility]
  )
  const skinlessArmor = useMemo(
    () => removeReskin(selectedArmor?.weaponLinkName),
    [selectedArmor]
  )
  const skinlessRing = useMemo(
    () => removeReskin(selectedRing?.weaponLinkName),
    [selectedRing]
  )

  const hasItem = (item) => {
    if (item === null) return -2
    if (selectedWeapon && skinlessWeapon === item) return 0
    if (selectedAbility && skinlessAbility === item) return 1
    if (selectedArmor && skinlessArmor === item) return 2
    if (selectedRing && skinlessRing === item) return 3
    return -1
  }

  function evaluateEquipment(weapon, ability, armor, ring) {
    const equipments = [weapon, ability, armor, ring]

    for (let i = 0; i < equipments.length; i++) {
      if (bannedItems.includes(equipments[i])) {
        return { result: 'banned', points: 0, itemIdx: i }
      }
    }

    let totalPoints = 0
    const pointsAssignedEquipment = [false, false, false, false]

    for (let i = 0; i < 4; i++) {
      for (let item of exaPointsList[i]) {
        if (item[0] === 'special') {
          // Special handling logic (not detailed here, please fill in)
        } else {
          const it = item[0]
          const itemType = itemTypes.get(it) - 1

          if (!equipments.includes(it) || pointsAssignedEquipment[itemType]) {
            continue
          }

          pointsAssignedEquipment[itemType] = true
          totalPoints += [5, 3, 2, 1][i] // Adjust points as necessary
        }
      }
    }

    for (let item of pointPenaltyItems) {
      if (equipments.includes(item)) {
        totalPoints-- // Deduct points for penalty items
      }
    }

    return { result: 'ok', points: totalPoints }
  }

  const characterEvaluation = useMemo(() => {
    async function populateExaltValues() {
      await ensureExaltValuesArePopulated()
    }
    populateExaltValues()

    return evaluateEquipment(
      skinlessWeapon,
      skinlessAbility,
      skinlessArmor,
      skinlessRing
    )
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
    if (characterEvaluation.result === 'banned') {
      const bannedItemName =
        [selectedWeapon, selectedAbility, selectedArmor, selectedRing][
          characterEvaluation.itemIdx
        ]?.name || 'Unknown item'
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
              {bannedItemName} is banned from an exalted Lost Halls run.
            </span>
          </Typography>
        </Paper>
      )
    } else {
      // This section handles the display when there are no banned items.
      // It checks if a character class is selected and displays points accordingly.
      if (!selectedCharacter) {
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
                Currently {characterEvaluation.points} points for an exalted
                Lost Halls run (no class selected).
              </span>
            </Typography>
          </Paper>
        )
      } else {
        // If a character class is selected, display the points and compare with the class requirement.
        const requirement = classRequirementLostHallsExalted[selectedCharacter]
        const pointsMet = characterEvaluation.points >= requirement
        const color = pointsMet ? 'green' : 'red'
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
              <span style={{ color }}>
                Your{' '}
                <img
                  src={`class_pictures/${selectedCharacter}.png`}
                  alt={selectedCharacter}
                  style={{
                    maxWidth: '50px',
                    maxHeight: '50px',
                    margin: '0 10px',
                  }}
                />
                has {characterEvaluation.points}/{requirement} points for an
                exalted Lost Halls run {pointsMet ? ':)' : ':('}
              </span>
            </Typography>
          </Paper>
        )
      }
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

      {/* Tabs Header */}
      <Typography
        variant="h6"
        component="h2"
        sx={{ mt: 2, mb: 1, fontWeight: 'medium' }}
        textAlign="center"
      >
        Select a tab
      </Typography>

      {/* Tabs */}
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{
            '.MuiTabs-indicator': {
              backgroundColor: '#1976d2', // Active tab indicator color
            },
            '.MuiTab-root': {
              '&.Mui-selected': {
                color: '#1976d2', // Active tab text color
              },
              fontWeight: 'bold',
              '&:hover': {
                color: '#115293', // Tab text hover color
                opacity: 1,
              },
            },
          }}
        >
          <Tab label="Scan through realmeye IGN" />
          <Tab label="Custom select" />
        </Tabs>
      </Box>

      {/* Tab 1 Content (Empty for now) */}
      <CustomTabPanel value={tabValue} index={0}>
        <p>
          This tab is currently under construction. Please use the "Custom
          Selection" for now :)
        </p>
      </CustomTabPanel>

      {/* Tab 2 Content */}
      <CustomTabPanel value={tabValue} index={1}>
        {middleBox()}

        {/* Center the selection box */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            mt: 2,
          }}
        >
          <Box sx={{ width: 300 }}>
            {' '}
            {/* Adjust width as needed */}
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
                <TextField
                  {...params}
                  label="Search Items"
                  variant="outlined"
                />
              )}
              onChange={(event, newValue) => {
                selectItem(newValue)
              }}
              fullWidth
            />
          </Box>
        </Box>

        {/* Display selected item images */}
        <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
          <Grid item>
            <img
              src={
                selectedWeapon
                  ? selectedWeapon.imageLocalPath
                  : `${import.meta.env.BASE_URL}gifs/weapon.gif`
              }
              alt="Selected Weapon"
              style={{ width: 80, height: 80 }} // Adjust size as needed
            />
          </Grid>
          <Grid item>
            <img
              src={
                selectedAbility
                  ? selectedAbility.imageLocalPath
                  : `${import.meta.env.BASE_URL}gifs/ability.gif`
              }
              alt="Selected Ability"
              style={{ width: 80, height: 80 }} // Adjust size as needed
            />
          </Grid>
          <Grid item>
            <img
              src={
                selectedArmor
                  ? selectedArmor.imageLocalPath
                  : `${import.meta.env.BASE_URL}gifs/armor.gif`
              }
              alt="Selected Armor"
              style={{ width: 80, height: 80 }} // Adjust size as needed
            />
          </Grid>
          <Grid item>
            <img
              src={
                selectedRing
                  ? selectedRing.imageLocalPath
                  : `${import.meta.env.BASE_URL}ring.png`
              }
              alt="Selected Ring"
              style={{ width: 80, height: 80 }} // Adjust size as needed
            />
          </Grid>
        </Grid>
      </CustomTabPanel>

      {/* Footer */}
      <Box
        sx={{
          width: '100%',
          p: 2,
          backgroundColor: '#e0e0e0',
          borderTop: '1px solid #bdbdbd',
          mt: 'auto',
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
