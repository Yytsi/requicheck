import React from 'react'
import {
  Paper,
  List,
  ListItem,
  Divider,
  Grid,
  Box,
  Typography,
} from '@mui/material'

// Displays a scrollable list of characters with their respective items and status messages
function CustomScrollableList({
  characters,
  sx,
  characterListResults,
  characterImageSheet64,
  getCharacterStyle,
  calculateCharacterMessage,
  CHAR_WIDTH,
  CHAR_HEIGHT,
}) {
  // form character messages
  const characterMessages =
    characterListResults.length !== 0
      ? characters.map((character, index) =>
          index < characterListResults.length
            ? calculateCharacterMessage(character, characterListResults[index])
            : { message: 'Unknown', sx: {} }
        )
      : []
  return (
    <Paper
      sx={{
        maxHeight: 400,
        overflow: 'auto',
        mt: 2,
        width: '100%', // Use the full width of the parent container by default
        minWidth: { sm: '80vw', md: '65vw', lg: '50vw' }, // Adjust the maximum width based on screen size
        transition: 'min-width 0.2s ease-in-out',
      }}
    >
      <List>
        {characters.map((character, index) => (
          <React.Fragment key={index}>
            <ListItem alignItems="flex-start">
              <Grid container spacing={2}>
                <Grid item xs={2}>
                  <Box
                    sx={getCharacterStyle(
                      'data:image/png;base64,' + characterImageSheet64,
                      character.characterIndex,
                      CHAR_WIDTH,
                      CHAR_HEIGHT,
                      characters.length
                    )}
                  />
                </Grid>
                <Grid item xs={8}>
                  <Grid container spacing={1}>
                    {character.items.map((item, itemIndex) => (
                      <Grid item key={itemIndex}>
                        <a
                          href={item}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <Box
                            component="img"
                            sx={{ height: 40, width: 40 }}
                            src={`downloaded_images/${
                              item.match(/\/wiki\/(.*?)\/?$/)[1] ?? 'unknown'
                            }.png`}
                            alt={item}
                          />
                        </a>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
                <Grid item xs={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      align="center"
                      sx={
                        characterMessages.length !== 0
                          ? characterMessages[index]?.sx ?? {}
                          : {}
                      }
                    >
                      {characterMessages.length !== 0 &&
                        (characterMessages[index].message ?? 'Unknown')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </ListItem>
            {index < characters.length - 1 && (
              <Divider component="li" sx={{ marginLeft: 0, width: '100%' }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  )
}

export default CustomScrollableList
