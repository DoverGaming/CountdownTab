chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.action === "refreshCountdown") {
          // Reload the content or refresh the entire page
          location.reload();
      }
  }
);
let countdowns = []
chrome.storage.sync.get('countdowns', (result) => {
    countdowns = result.countdowns
    if (countdowns == undefined) {
        countdowns = []
    } else {
        countdowns.forEach((countdown) => {
            const name = countdown.name
            const date = countdown.date
            const dateA = new Date(date)
            const time = calculateTimeFormat(dateA)
            const div = document.createElement('div')
            div.setAttribute('class', 'countdown')
            const titleDiv = document.createElement('div')
            titleDiv.setAttribute('class', 'countdown-title')
            titleDiv.innerHTML = name
            const dateDiv = document.createElement('div')
            dateDiv.setAttribute('class', 'countdown-date')
            dateDiv.innerHTML = `<div class="value">${date}</div>`
            let valueDiv = document.createElement('div')
            valueDiv.setAttribute('class', 'countdown-value')
            valueDiv.setAttribute('id', name)
            valueDiv = updateValueDiv(time, valueDiv)
            div.appendChild(titleDiv)
            div.appendChild(valueDiv)
            const actionsDiv = document.createElement('div')
            actionsDiv.setAttribute('class', 'actions')
            if (countdown.background == undefined) {
              const imgBtn = document.createElement('button')
              imgBtn.setAttribute('class', 'action-btn')
              imgBtn.innerHTML = 'Add Background'
              imgBtn.onclick = () => {
                  //prompt user for image url
                  const url = prompt('Enter image url')
                  // check if url is valid and is valid image and is valid against url&img regex
                  const urlRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g
                  if (url != null && url != '' && url.match(urlRegex)) {
                      // save url to storage for this countdown
                      chrome.storage.sync.get('countdowns', (result) => {
                          let countdowns = result.countdowns
                          countdowns.forEach((countdown) => {
                              if (countdown.name == name) {
                                  countdown.background = url
                              }
                          })
                          chrome.storage.sync.set({ 'countdowns': countdowns }, () => {
                              console.log('Value is set to ' + countdowns)
                              window.location.reload()
                          })
                      })
                  } else {
                      alert('Invalid url')
                  }
              }
              actionsDiv.appendChild(imgBtn)
            } else {
              // add background image
              const img = document.createElement('img')
              img.setAttribute('class', 'background')
              img.setAttribute('src', countdown.background)
              div.appendChild(img)
              // remove background button
              const imgBtn = document.createElement('button')
              imgBtn.setAttribute('class', 'action-btn')
              imgBtn.innerHTML = 'Remove Background'
              imgBtn.onclick = () => {
                  // remove background from storage
                  chrome.storage.sync.get('countdowns', (result) => {
                      let countdowns = result.countdowns
                      countdowns.forEach((countdown) => {
                          if (countdown.name == name) {
                              countdown.background = undefined
                          }
                      })
                      chrome.storage.sync.set({ 'countdowns': countdowns }, () => {
                          console.log('Value is set to ' + countdowns)
                          window.location.reload()
                      })
                  })
              }
              actionsDiv.appendChild(imgBtn)
            }
            const delBtn = document.createElement('button')
            delBtn.setAttribute('class', 'action-btn')
            delBtn.innerHTML = '🗑️'
            delBtn.onclick = () => {
                chrome.storage.sync.get('countdowns', (result) => {
                    let countdowns = result.countdowns
                    countdowns.forEach((countdown, index) => {
                        if (countdown.name == name) {
                            countdowns.splice(index, 1)
                        }
                    })
                    chrome.storage.sync.set({ 'countdowns': countdowns }, () => {
                        console.log('Value is set to ' + countdowns)
                        window.location.reload()
                    })
                })
            }
            actionsDiv.appendChild(delBtn)
            div.appendChild(actionsDiv)
            document.getElementsByClassName('countdowns')[0].appendChild(div)
            setInterval(() => {
                const time = calculateTimeFormat(dateA)
                let valueDiv2 = document.getElementById(name)
                valueDiv2.innerHTML = ''
                updateValueDiv(time, valueDiv2)
            }, 1000)
        })
    }
})
function calculateTimeFormat(targetDate) {
  const now = new Date();
  const diffInSeconds = Math.floor((targetDate - now) / 1000);

  const secondsInMinute = 60;
  const secondsInHour = 60 * 60;
  const secondsInDay = 24 * 60 * 60;
  const secondsInWeek = 7 * 24 * 60 * 60;
  const secondsInMonth = 30 * 24 * 60 * 60;  // Assuming an average month

  if (diffInSeconds < secondsInWeek) {
      return {
          type: 'dhms',
          days: Math.floor(diffInSeconds / secondsInDay),
          hours: Math.floor((diffInSeconds % secondsInDay) / secondsInHour),
          minutes: Math.floor((diffInSeconds % secondsInHour) / secondsInMinute),
          seconds: diffInSeconds % secondsInMinute
      };
  } else if (diffInSeconds < secondsInMonth) {
      return {
          type: 'wdhm',
          weeks: Math.floor(diffInSeconds / secondsInWeek),
          days: Math.floor((diffInSeconds % secondsInWeek) / secondsInDay),
          hours: Math.floor((diffInSeconds % secondsInDay) / secondsInHour),
          minutes: Math.floor((diffInSeconds % secondsInHour) / secondsInMinute)
      };
  } else {
      return {
          type: 'mwdh',
          months: Math.floor(diffInSeconds / secondsInMonth),
          weeks: Math.floor((diffInSeconds % secondsInMonth) / secondsInWeek),
          days: Math.floor((diffInSeconds % secondsInWeek) / secondsInDay),
          hours: Math.floor((diffInSeconds % secondsInDay) / secondsInHour)
      };
  }
}
function updateValueDiv(time, valueDiv) {
  if (time.type == 'dhms') {
    const daysDiv = document.createElement('div')
    daysDiv.setAttribute('class', 'days')
    daysDiv.innerHTML = `<div class="value">${time.days}</div><div class="label">Days</div>`
    const hoursDiv = document.createElement('div')
    hoursDiv.setAttribute('class', 'hours')
    hoursDiv.innerHTML = `<div class="value">${time.hours}</div><div class="label">Hours</div>`
    const minutesDiv = document.createElement('div')
    minutesDiv.setAttribute('class', 'minutes')
    minutesDiv.innerHTML = `<div class="value">${time.minutes}</div><div class="label">Minutes</div>`
    const secondsDiv = document.createElement('div')
    secondsDiv.setAttribute('class', 'seconds')
    secondsDiv.innerHTML = `<div class="value">${time.seconds}</div><div class="label">Seconds</div>`
    valueDiv.appendChild(daysDiv)
    valueDiv.appendChild(hoursDiv)
    valueDiv.appendChild(minutesDiv)
    valueDiv.appendChild(secondsDiv)
  } else if (time.type == 'wdhm') {
    const weeksDiv = document.createElement('div')
    weeksDiv.setAttribute('class', 'weeks')
    weeksDiv.innerHTML = `<div class="value">${time.weeks}</div><div class="label">Weeks</div>`
    const daysDiv = document.createElement('div')
    daysDiv.setAttribute('class', 'days')
    daysDiv.innerHTML = `<div class="value">${time.days}</div><div class="label">Days</div>`
    const hoursDiv = document.createElement('div')
    hoursDiv.setAttribute('class', 'hours')
    hoursDiv.innerHTML = `<div class="value">${time.hours}</div><div class="label">Hours</div>`
    const minutesDiv = document.createElement('div')
    minutesDiv.setAttribute('class', 'minutes')
    minutesDiv.innerHTML = `<div class="value">${time.minutes}</div><div class="label">Minutes</div>`
    valueDiv.appendChild(weeksDiv)
    valueDiv.appendChild(daysDiv)
    valueDiv.appendChild(hoursDiv)
    valueDiv.appendChild(minutesDiv)
  } else if (time.type == 'mwdh') {
    const monthsDiv = document.createElement('div')
    monthsDiv.setAttribute('class', 'months')
    monthsDiv.innerHTML = `<div class="value">${time.months}</div><div class="label">Months</div>`
    const weeksDiv = document.createElement('div')
    weeksDiv.setAttribute('class', 'weeks')
    weeksDiv.innerHTML = `<div class="value">${time.weeks}</div><div class="label">Weeks</div>`
    const daysDiv = document.createElement('div')
    daysDiv.setAttribute('class', 'days')
    daysDiv.innerHTML = `<div class="value">${time.days}</div><div class="label">Days</div>`
    const hoursDiv = document.createElement('div')
    hoursDiv.setAttribute('class', 'hours')
    hoursDiv.innerHTML = `<div class="value">${time.hours}</div><div class="label">Hours</div>`
    valueDiv.appendChild(monthsDiv)
    valueDiv.appendChild(weeksDiv)
    valueDiv.appendChild(daysDiv)
    valueDiv.appendChild(hoursDiv)
  }
  return valueDiv
}