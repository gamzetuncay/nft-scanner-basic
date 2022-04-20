import { getUserData, UserData } from '@decentraland/Identity'

// get player data
export let userData: UserData

export async function setUserData() {
  const data = await getUserData()
  log(data.displayName)
  userData = data
}

// external servers being used by the project
export const fireBaseServer = 'https://us-central1-dcl-guestbook0.cloudfunctions.net/app/'

/**
 * It gets all guests data from server
 * @returns array of json
 */
export async function getGuestBook() {
  try {
    const url = fireBaseServer + 'get-signatures'
    const response = await fetch(url)
    const json = await response.json()
    log(json)
    return json
  } catch (e) {
    log('error fetching scores from server ', e)
  }
}

/**
 * It gets specific user data
 * @returns array of json with length 1
 */
export async function getGuest() {
  return await filterByID(await getGuestBook(), userData.userId)
}

/**
 * Add user data to server
 * If user already exists, just increase the counter
 * @returns 
 */
export async function signGuestBook() {
  let guest = await getGuest() // get guest data for counter
  try {
    if(guest>0){ // if guest is already exist in database: update count variable
      const url = fireBaseServer + 'update-signature?doc='+ userData.userId
      const body = JSON.stringify({
        id: userData.userId,
        time: await guest[0].time,
        count: await guest[0].count+1
      })
      log(body)
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
      })
      return response.json()
    }
    else{  // new user entry
      const url = fireBaseServer + 'add-signature'
      const body = JSON.stringify({
        id: (await userData).userId,
        name: (await userData).displayName,
        time: new Date().toString(),
        count: 1
      })
      log(body)
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
      })
      return response.json()
    }
  } catch (e) {
    log('error posting to server ', e)
  }
}

/**
 * Updates signature time with current time
 * @returns 
 */
export async function updateSignatureTime(){
  let guest = await getGuest()

  try{
    const url = fireBaseServer + 'update-signature?doc='+ userData.userId
    const body = JSON.stringify({
      id: userData.userId,
      time: new Date().toString(),
      count: await guest[0].count
    })
    log(body)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    })
    return response.json()
  } catch (e) {
    log('error posting to server ', e)
  }
}

/**
 * Utility function for checking existance of an user
 * @param data array of json : all Guests data
 * @param id string : id of specific user
 * @returns array of json with lenght 1: filtered data
 */
async function filterByID(data : any, id: string){
  return data.filter((e : any) => e.id == id)
}

/**
 * Utility function to print all names in the GuestBook
 * @returns {
 *           numberOfGuests int
 *           guestList string : consists of names and '-'
 *          } 
 */
async function displayGuests(){
  let allGuests = await getGuestBook()
  let guestList = ''
  let numberOfGuests = allGuests.length
  for(let i=0; i<allGuests.length; i++){ 
    guestList = guestList.concat(allGuests[i].name).concat('-')
  }
  return {numberOfGuests, guestList}
}

