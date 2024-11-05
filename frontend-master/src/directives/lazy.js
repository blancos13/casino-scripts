export default {
    inserted (el, { arg, value }, vm) {
        function loadImage () {
            if (!el) {
                return false
            }

            let img = value.default

            if (value.id) {
                if (value.id.includes('//')) {
                    img = value.id
                } else {
                    img = `http://localhost:3000/api/attachment/${value.id}`
                }
            }

            if (arg === 'background') {
                el.style.backgroundImage = `url(${img})`
            } else if (el.nodeName === 'IMG') {
                el.src = img
            }
        }

        function handleIntersect (entries, observer) {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return null
                } else {
                    loadImage()
                    observer.unobserve(el)
                }
            })
        }

        function createObserver () {
            const options = {
                root: null,
                threshold: '0'
            }
            const observer = new IntersectionObserver(handleIntersect, options)

            observer.observe(el)
        }

        if (!window.IntersectionObserver) {
            loadImage()
        } else {
            createObserver()
        }
    }

  }