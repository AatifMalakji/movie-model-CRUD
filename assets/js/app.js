const cl = console.log;

const form = document.getElementById('mform')
const title = document.getElementById('title')
const murl = document.getElementById('murl')
const description = document.getElementById('description')
const rating = document.getElementById('rating')
const submitbtn = document.getElementById('submitbtn')
const updatebtn = document.getElementById('updatebtn')
const dropdown = document.getElementById('dropdown')
const backdrop = document.getElementById('backdrop')
const loader = document.getElementById('loader')
const hideshow = [...document.querySelectorAll('.hideshow')]
const moviescontainer = document.getElementById('moviescontainer')

const snackbar = (msg, i) => {
    Swal.fire({
        title: msg,
        icon: i,
        timer: 1000
    })
}
const ratingcolor = (n) => {
    if (n < 3) {
        return 'bg-danger'
    } else if (n <= 4) {
        return 'bg-warning'
    } else {
        return 'bg-info'
    }
}
const objtoarr = (obj) => {
    let arr = []
    for (const key in obj) {
        arr.push({ ...obj[key], id: key })
    }
    return arr
}
const onhideshow = () => {
    dropdown.classList.toggle('d-none')
    backdrop.classList.toggle('d-none')
}
const baseurl = `https://movie-model-7a4c8-default-rtdb.firebaseio.com`
const posturl = `${baseurl}/posts.json`
const apicall = async (url, method, body) => {
    try {
        loader.classList.remove('d-none')
        body = body ? JSON.stringify(body) : null
        let res = await fetch(url, {
            method: method,
            body: body,
            headers: {
                'content-type': 'application/json',
                Auth: 'token'
            }
        })
        return res.json()
    } catch (err) {
        snackbar(err, 'error')
    } finally {
        loader.classList.add('d-none')
    }

}
const fetchmovies = async () => {
    try {
        let res = await apicall(posturl, 'GET')
        createcards(objtoarr(res))
    } catch (err) {
        snackbar(err, 'error')
    }
}
fetchmovies()
const createcards = (arr) => {
    let result = arr.map(m => {
        return `   <div class="col-md-4 mb-3" id="${m.id}">
            <div class="mcard">
                <figure>
                    <img src="${m.url}" alt="movie-img">
                        <div class="title px-3 d-flex justify-content-between">
                            <p>${m.title}</p>
                            <span class=" bg-danger text-center">${m.rating}</span>
                        </div>
                        <div class="description">
                            <p>${m.description}</p>
                            <div class="buttons px-3 d-flex justify-content-between">
                                <button class="btn btn-outline-info" onclick="onedit(this)">Edit</button>
                                <button class="btn btn-outline-warning" onclick="onremove(this)">Remove</button></div>
                        </div>
                    </img>
                </figure>
            </div>
        </div>`
    }).join('')
    moviescontainer.innerHTML = result
}
const onedit = async (e) => {
    try {
        let editid = e.closest('.col-md-4').id
        localStorage.setItem('editid', editid)
        let editurl = `${baseurl}/posts/${editid}.json`
        let res = await apicall(editurl, 'GET')
        title.value = res.title
        description.value = res.description
        murl.value = res.url
        rating.value = res.rating
        dropdown.classList.remove('d-none')
        backdrop.classList.remove('d-none')
        submitbtn.classList.add('d-none')
        updatebtn.classList.remove('d-none')
    } catch (err) {
        snackbar(err, 'error')
    }
}
const onupdate = async () => {
    try {
        let updateid = localStorage.getItem('editid')
        let updateurl = `${baseurl}/posts/${updateid}.json`
        let obj = {
            title: title.value,
            url: murl.value,
            description: description.value,
            rating: rating.value
        }
        let res = await apicall(updateurl, 'PATCH', obj)
        let div = document.getElementById(updateid)
        div.querySelector('img').setAttribute('src', obj.url)
        div.querySelector('.title p').innerHTML = obj.title
        div.querySelector('.description p').innerHTML = obj.description
        let span = div.querySelector('.title span')
        span.className = `${ratingcolor(obj.rating)} text-center`
        span.innerHTML = obj.rating

        form.reset()
        dropdown.classList.add('d-none')
        backdrop.classList.add('d-none')
        submitbtn.classList.remove('d-none')
        updatebtn.classList.add('d-none')
    } catch (err) {
        snackbar(err, 'error')
    }

}
const onremove = async (e) => {
    try {
        let res = await Swal.fire({
            title: "Do you want to Remove the Movie?",
            showCancelButton: true,
            confirmButtonText: "Remove",
        })
        if (res.isConfirmed) {
            let removeid = e.closest('.col-md-4').id
            let removeurl = `${baseurl}/posts/${removeid}.json`
            let res = await apicall(removeurl, 'DELETE')
            document.getElementById(removeid).remove()
            snackbar('Removed Successfully', 'success')
        }
    } catch (err) {
        snackbar(err, 'error')
    }
}
const onsubmit = async (e) => {
    try {
        e.preventDefault()
        let obj = {
            title: title.value,
            url: murl.value,
            description: description.value,
            rating: rating.value
        }
        let res = await apicall(posturl, 'POST', obj)
        let div = document.createElement('div')
        div.id = res.name
        div.className = 'col-md-4 mb-3'
        div.innerHTML = `<div class="mcard">
                <figure>
                    <img src="${obj.url}" alt="movie-img">
                        <div class="title px-3 d-flex justify-content-between">
                            <p>${obj.title}</p>
                            <span class=" ${ratingcolor(obj.rating)} text-center">${obj.rating}</span>
                        </div>
                        <div class="description">
                            <p>${obj.description}</p>
                            <div class="buttons px-3 d-flex justify-content-between">
                                <button class="btn btn-outline-info" onclick="onedit(this)">Edit</button>
                                <button class="btn btn-outline-warning" onclick="onremove(this)">Remove</button></div>
                        </div>
                    </img>
                </figure>
            </div>`
        moviescontainer.prepend(div)
        form.reset()
        dropdown.classList.add('d-none')
        backdrop.classList.add('d-none')
    } catch (err) {
        snackbar(err, 'error')

    }
}






updatebtn.addEventListener('click', onupdate)
hideshow.forEach(e => e.addEventListener('click', onhideshow))
form.addEventListener('submit', onsubmit)