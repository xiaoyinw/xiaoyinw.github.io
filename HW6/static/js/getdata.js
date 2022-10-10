$(document).ready(function() {
    $("form").submit(function (event) {
        event.preventDefault()
        $.get("/search", {keyword: $('#keyword').val(), 
        distance: $('#distance').val(),
        category: $('#category').val(),
        location: $('#location').val()}, function(data) {
            businessinfo = data['businesses']
            businessdiv  = document.getElementById("businessdiv")
            businessdiv.innerHTML = ''
            businesstable = document.createElement("table")
            businesstable.setAttribute("id", "businesstable")
            businesstable.setAttribute("class", "sortable")
            businessdiv.appendChild(businesstable)

            heading = document.createElement("tr")
            heading.setAttribute("id", "heading")
            document.getElementById("businesstable").appendChild(heading)

            order = document.createElement("th");
            orderText = document.createTextNode("No.");
            order.setAttribute("id", "orderHeader")
            order.appendChild(orderText);
            heading.appendChild(order)

            img = document.createElement("th");
            imgText = document.createTextNode("Image");
            img.setAttribute("id", "imgHeader")
            img.appendChild(imgText);
            heading.appendChild(img)

            business = document.createElement("th");
            businessText = document.createTextNode("Business Name");
            business.setAttribute("id", "businessHeader")
            business.appendChild(businessText);
            business.onclick = sortable
            heading.appendChild(business)

            rating = document.createElement("th");
            ratingText = document.createTextNode("Rating");
            rating.setAttribute("id", "ratingHeader")
            rating.appendChild(ratingText);
            rating.onclick = sortable
            heading.appendChild(rating)

            distance = document.createElement("th");
            distanceText = document.createTextNode("Distance(miles)");
            distance.appendChild(distanceText);
            distance.setAttribute("id", "distanceHeader")
            distance.onclick = sortable
            heading.appendChild(distance)

            for (let i = 0; i < businessinfo.length; i++) {
                const row = document.createElement('tr')
                
                const orderNode = document.createElement('td')
                const orderTextNode = document.createTextNode(i + 1)
                orderNode.setAttribute("class", "order")
                orderNode.appendChild(orderTextNode)
                row.appendChild(orderNode)

                const imgNode = document.createElement('td')
                imgNode.style.backgroundImage = "url(" + businessinfo[i]['image_url'] + ")"
                imgNode.setAttribute("class", "img")
                row.appendChild(imgNode)
                
                const businessNode = document.createElement('td')
                const businessTextNode = document.createTextNode(businessinfo[i]['name'])
                businessNode.appendChild(businessTextNode)
                businessNode.setAttribute("class", "business")
                businessNode.setAttribute("id", businessinfo[i]['id'])
                businessNode.onclick = showcard
                row.appendChild(businessNode)

                const ratingNode = document.createElement('td')
                const ratingTextNode = document.createTextNode(businessinfo[i]['rating'])
                ratingNode.appendChild(ratingTextNode)
                ratingNode.setAttribute("class", "rating")
                row.appendChild(ratingNode)

                const distanceNode = document.createElement('td')
                const distanceTextNode = document.createTextNode(parseFloat((businessinfo[i]['distance']) * 0.000621371).toFixed(2))
                distanceNode.appendChild(distanceTextNode)
                distanceNode.setAttribute("class", "distance")
                row.appendChild(distanceNode)
                businesstable.appendChild(row)
            } 
        })
    })

    $(".autolocate").click(function (event) {
        autolocate = document.getElementById('autolocate')
        autolocate.checked = true       
        $.get("/autolocate", function (data) { 
            locationInput = document.getElementById("location")
            locationInput.value = null
            locationInput.disabled = true
         })
      })

    $(".cancel").click(function (event) {  
        event.preventDefault()
        
        keywordInput = document.getElementById("keyword")
        keywordInput.value = ''
        
        categoryInput = document.getElementById("category")
        categoryInput.value = 'Default'
        
        distanceInput = document.getElementById("distance")
        distanceInput.value = 10

        locationInput = document.getElementById("location")
        locationInput.value = ''
        locationInput.disabled = false

        autolocate = document.getElementById("autolocate")
        autolocate.checked = false
    })

    $(".business").click(function (event) {
        console.log(event)
        card = document.getElementById("card")    
        card.hidden = false
    })
})

function sortable(event) {
    sortDict = {"Business Name": 2,
                "Rating": 3,
                "Distance(miles)": 4}
    val = event.target.innerHTML
    index = sortDict[val]
    businesstable = document.getElementById("businesstable")
    switching = true
    /*Make a loop that will continue until
  no switching has been done:*/
    while (switching) {
        switching = false;
        rows = rows = businesstable.rows
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[index];
            y = rows[i + 1].getElementsByTagName("td")[index];
            if (index === 3) {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }

    for (i = 1; i < rows.length; i++) {
        cur = rows[i].getElementsByTagName('td')
        cur[0].innerHTML = i
    }
}


function showcard(event) {      
    $.get("/searchdetail", {id: event.target.id},function (data) { 
        card = document.getElementById("card")
        card.hidden = false

        cardhead = document.getElementById('cardhead')
        cardhead.innerHTML = ''
        cardHeadtext = document.createTextNode(data['detail']['alias'])
        cardhead.appendChild(cardHeadtext)
        
        cardstatus = document.getElementById('cardstatus')
        cardstatus.innerHTML = ''
        cardstatus.setAttribute("style", "padding: 5px 0")
        cardstatuschild = document.createElement('p')
        cardstatustext = document.createTextNode(data['detail']['is_closed'] ? "Closed" : "Open")
        if (data['detail']['is_closed']) {
            cardstatuschild.setAttribute('style', 'background: #a84909; border-radius: 15px; justify-content: center; text-align: center; padding: 10px 0; margin-left: 0; margin-right: 80%')
        }
        else {
            cardstatuschild.setAttribute('style', 'background: #4da866; border-radius: 15px; justify-content: center; text-align: center; padding: 10px 0; margin-left: 0; margin-right: 80%')
        }
        cardstatuschild.appendChild(cardstatustext)
        cardstatus.appendChild(cardstatuschild)

        cardcategory = document.getElementById("cardcategory")
        cardcategory.innerHTML = ''
        cardcategorytext = document.createElement('p')
        cardcategorytext.innerHTML = data['detail']['categories'].map(d => d['alias']).join(' | ')
        cardcategory.appendChild(cardcategorytext)

        cardaddress = document.getElementById('cardAddress')
        cardaddress.innerHTML = ''
        cardaddresstext= document.createElement('p')
        cardaddresstext.innerHTML = data['detail']['location']['address1']
        cardaddress.appendChild(cardaddresstext)

        cardphonenumber = document.getElementById('cardPhoneNumber')
        cardphonenumber.innerHTML = ''
        cardphonenumbertext = document.createElement('p')
        cardphonenumbertext.innerHTML = data['detail']['phone']
        cardphonenumber.appendChild(cardphonenumbertext)

        cardtransaction = document.getElementById('cardTransaction')
        cardtransaction.innerHTML = ''
        cardtransactiontext = document.createElement('p')
        cardtransactiontext.innerHTML = data['detail']['transactions'].length > 0 ? data['detail']['transactions'].join(' | ') : "Unavailable"
        cardtransaction.appendChild(cardtransactiontext)

        cardprice = document.getElementById('cardPrice')
        cardprice.innerHTML = ''
        cardpricetext = document.createElement('p')
        cardpricetext.innerHTML = data['detail']['price']
        cardprice.appendChild(cardpricetext)

        cardinfo = document.getElementById("cardInfo")
        cardinfo.innerHTML = ''
        cardlink = document.createElement('a')
        cardlink.setAttribute('href', data['detail']['url'])
        cardlink.innerHTML = "Yelp"
        cardinfo.appendChild(cardlink)

        cardphotos = document.getElementById('cardphotos')
        cardphotos.innerHTML = ''
        for(let i = 0; i < data['detail']['photos'].length; i++) {
            photo = document.createElement('div')
            photo.setAttribute('style', 'margin: 5px; background-position: center; background-image:' + "url(" + data['detail']['photos'][i] + ")")
            cardphotos.appendChild(photo)
        }
    })
 }