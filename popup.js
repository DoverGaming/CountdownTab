const nameC = document.getElementById('name')
const dateC = document.getElementById('date')
const submit = document.getElementById('submit')
nameC.addEventListener('input', () => {
    if (nameC.value != '' && dateC.value != '' && checkDate(dateC.value)) {
        submit.disabled = false
    } else {
        submit.disabled = true
    }
})
date.addEventListener('input', () => {
    if (nameC.value != '' && dateC.value != '' && checkDate(dateC.value)) {
        submit.disabled = false
    } else {
        submit.disabled = true
    }
})
// function to check if date is in the past
function checkDate(date) {
    const today = new Date()
    const dateA = new Date(date)
    console.log(dateA < today)
    if (dateA < today) {
        return false
    }
    return true
}
submit.onclick = () => {
    const name = nameC.value
    const date = dateC.value
    chrome.storage.sync.get('countdowns', (result) => {
        let countdowns = result.countdowns
        if (countdowns == undefined) {
            countdowns = []
        }
        countdowns.push({ name: name, date: date })
        chrome.storage.sync.set({ 'countdowns': countdowns }, () => {
            console.log('Value is set to ' + countdowns)
            window.close()
        })
    })
}