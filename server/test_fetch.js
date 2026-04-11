fetch('https://edu-tracker-six.vercel.app/')
  .then(r => r.text())
  .then(html => {
    const match = html.match(/src="\/assets\/index-(.*?)\.js"/);
    if(match) {
      fetch('https://edu-tracker-six.vercel.app/assets/index-' + match[1] + '.js')
        .then(r => r.text())
        .then(js => console.log(js.substring(0, 500)));
    }
  });
