# STAGING-specific deployment configuration
# please put general deployment config in config/deploy.rb

puts "Deploying to STAGING"

# The gateway server is accessed before anything else and all ssh commands sent via it so that other servers do not have to be exposed through the firewall
set :gateway,     "gromit.etl.office"

set :scm_domain,  "intra.causata.com"
set :domain,      "gromit"
set :rails_env,   "gromit"

# construct the path to the repository
set :repository,   "https://#{scm_domain}/svn/javascript/tag-tools/trunk/demo-sites/spree/"

#If you log into your server with a different user name than you are logged 
#into your local machine with, youll need to tell Capistrano about that user 
#name.
set :user, "dev"

# webserver root symlink path for passenger
set :webroot, "/var/www/html/#{application}"

# all services are on the same server for now
role :app, domain
role :web, domain
role :db,  domain, :primary => true
