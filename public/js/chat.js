const socket = io();

//elements:
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages"); //the place to render the template

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate=document.querySelector("#locationurl-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML;

//options
const  {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true}) 

const autoscroll=()=>{
//new message element
const $newMessage=$messages.lastElementChild
//hieght of the new message
const newMessageStyle=getComputedStyle($newMessage)
const newMessageMargin=parseInt(newMessageStyle.marginBottom)
const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
//visible hieght
const visibleHeight=$messages.offsetHeight
//height of message container
const containerHeight=$messages.scrollHeight//the total height we are able to scroll through
//how far down have i scrolled
const scrollOffset=$messages.scrollTop+visibleHeight
//if we are at the bottom before the last item was added?
if(containerHeight-newMessageHeight<=scrollOffset){
  $messages.scrollTop=$messages.scrollHeight
}

}

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, { 
    username:message.username,
      message:message.text,
    createdAt:moment(message.createdAt).format('h:m a')
     });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
}); //accept name

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplate, { 
      username:message.username,
      url:message.url,
      createdAt:moment(message.createdAt).format('h:m a')
    });
  $messages.insertAdjacentHTML("beforeend", html);
autoscroll()

}); 

socket.on('roomData',({room,users})=>{
  const html=Mustache.render(sidebarTemplate,{
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault(); //prevent refresh browser
  $messageFormButton.setAttribute("disabled", "disabled"); //disable
  const message = e.target.elements.message.value;
  //    document.querySelector("input").value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled"); //enable it
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("geolocation is not supported by your browser");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longtitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled"); //enable it
        console.log("location shared");
      }
    );
  }); //async function, because it takes time, but cannot use the sync await or promise chain
});

socket.emit('join',{username,room},(error)=>{
  if(error){
    alert(error)
    location.href='/'
  }
})