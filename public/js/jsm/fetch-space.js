export default function () {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams(document.location.search);
    const id = params.get('id');

    fetch(`/api?id=${id}`)
    .then(res => res.json())
    .then(data => {
      resolve(data)
    })
  });
};