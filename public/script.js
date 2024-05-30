const host = "http://localhost:2000/";
document
  .querySelector("#create-short-url")
  .addEventListener("click", function () {
    let longurl = document.querySelector("#longurl").value.trim();
     //removes white spaces from both sides
          
    if (longurl.length == 0) {
      alert("Please enter a valid URL");
      return;
    } else if (
      !(longurl.startsWith("http://") || longurl.startsWith("https://"))
    ) {
      alert("Enter Valid Link");
      return;
    }

    fetch(host + "api/create-short-url", {
      method: "POST",
      body: JSON.stringify({
        longurl: longurl,
      }),
      headers: { "Content-Type": "application/json; charset=UTF-8" },
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        if (data.status === "success") {

          const shortUrl = host + data.shorturlid;

          let existingRow = document.querySelector(`#list_urls tbody tr[data-shorturlid="${data.shorturlid}"]`);

          if (existingRow) {
          
            document.querySelector("#short-url").innerHTML= "Previously generated link : "+shortUrl;

          }else {
            document.querySelector("#short-url").innerHTML = shortUrl;
          }

          document.querySelector("#short-url").href = host + data.shorturlid;

          if (!existingRow) {
          let html = 
          ` <tr data-shorturlid="${data.shorturlid}">
                <td>${longurl}</td>
                <td>${host}${data.shorturlid}</td>
                <td>${0}</td>
            </tr>`;

          document.querySelector("#list_urls tbody").innerHTML += html;
          }
        }
      })
      .catch(function (error) {
        console.log("Some error occurred", error);
      });
  });
(function () {
  fetch(host + "api/get-all-short-urls")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      let html = "";
      for (let i = 0; i < data.length; i++) {
        html += `
<tr data-shorturlid="${data[i].shorturlid}">
    <td>${data[i].longurl}</td>
    <td>${host}${data[i].shorturlid}</td>
    <td>${data[i].count}</td>
</tr>
    `;
      }
      document.querySelector("#list_urls tbody").innerHTML = html;
    })
    .catch(function (error) {
      alert("Something went wrong");
    });
})();
