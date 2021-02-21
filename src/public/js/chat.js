const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')
//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options
const {username, room} = Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoScroll=()=>{
  //New message
  const $newMessage = $messages.lastElementChild
  //Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  //Visible height
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  //How far have i scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
}
socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('LocationMessage',(message)=>{
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        locationUrl:message.url,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
   $messages.insertAdjacentHTML('beforeend', html)
   autoScroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')

    const msg = e.target.elements.message.value
    socket.emit('sendMessage',msg,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
       if(error){
          return console.log(error)
       }
       console.log('Message Delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    $sendLocationButton.setAttribute('disabled','disabled')
   if(!navigator.geolocation){
     return alert('GeoLocation is not supported bu your browser.')
   }
   
   navigator.geolocation.getCurrentPosition((position)=>{
    const coordinates = {latitude:position.coords.latitude,longitude:position.coords.longitude}
    socket.emit('sendLocation',coordinates,()=>{
        $sendLocationButton.removeAttribute('disabled')
        console.log('Location shared')
    })
   })
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
   document.querySelector('#sidebar').innerHTML = html  
})

socket.emit('join',({username,room}),(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})