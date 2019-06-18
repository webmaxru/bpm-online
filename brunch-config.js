// See http://brunch.io for documentation.
exports.config = {
  server: {
    port: 3000,
    noCors: true
  },
  paths: {
    public: './public',
    watched: ['app']
  },
  files: {
    javascripts: {
      joinTo: {
        '/js/master.js': /^(app[\/\\]app\.js|app[\/\\]components[\/\\]realtime\-bpm\-analyzer[\/\\]src|node_modules)/
      }
    },
    stylesheets: {
      joinTo: {
        '/css/master.css': /^(app)/
      }
    }
  },
  conventions: {
    ignored: [
      /^app\/components\/realtime\-bpm\-analyzer\/test/
    ]
  },
  plugins: {
    cleancss: {
      keepSpecialComments: 0,
      removeEmpty: true
    },
    sass: {
      mode: 'native',
      // debug: 'comments',
      options: {
        includePaths: ['./node_modules/bootstrap/scss/'],
        precision: 8
      }
    },
  }
};