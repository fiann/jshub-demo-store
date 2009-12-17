# Enable multistage deploys
set :stages, %w(staging production)
set :default_stage, "staging"
require 'capistrano/ext/multistage'

# name of the application
set :application, "retail"

# If you aren't deploying to /u/apps/#{application} on the target
# servers (which is the default), you can specify the actual location
# via the :deploy_to variable:
set :deploy_to,   "/var/capistrano/#{application}"

# If you aren't using Subversion to manage your source code, specify
# your SCM below:
set :scm,         "subversion"

#By default, Capistrano will try to use sudo to do certain operations (setting 
#up your servers, restarting your application, etc.). If you are on a shared 
#host, sudo might be unavailable to you, or maybe you just want to avoid using sudo.
set :use_sudo,    false

# Liam: overide the default task as we are using Passenger
# ref: http://www.modrails.com/documentation/Users%20guide.html#capistrano
namespace :deploy do
  desc "Restart Application"
  task :restart, :roles => :app do
    run "touch #{current_path}/tmp/restart.txt"
  end
end

# additional custom tasks viewable with 'cap -T'
namespace :custom do
  desc 'Symlink the public directory into the web root. This is for use by Passenger via RailsBaseURI
        ref: http://www.modrails.com/documentation/Users%20guide.html#deploying_rails_to_sub_uri'
  task :link_webroot do
    run "ln -nfs #{current_path}/public #{webroot}"
  end

  desc 'Output the Subversion version number'
  task :version do
    run "echo \"r#{real_revision}\" > #{release_path}/app/views/shared/_version.html.erb"
  end
  
  desc 'Run db:bootstrap unattended to setup sample products'
  task :bootstrap do
    run "cd #{deploy_to}/current; rake db:bootstrap AUTO_ACCEPT='true'"
  end
end
# use our custom tasks at the appropriate time
# e.g. before :deploy, :my_custom_task
#      after  "deploy:symlink", :do_this, :and_do_that
after "deploy:update",   "deploy:migrate", "custom:version"
after "deploy:setup",   "custom:link_webroot"
