# Settings specified here will take precedence over those in config/environment.rb

# The production environment is meant for finished, "live" apps.
# Code is not reloaded between requests
config.cache_classes = true

# Use a different logger for distributed setups
# config.logger = SyslogLogger.new

# Full error reports are disabled and caching is turned on
config.action_controller.consider_all_requests_local = false
config.action_controller.perform_caching             = true

# Enable serving of images, stylesheets, and javascripts from an asset server
# config.action_controller.asset_host                  = "http://assets.example.com"

# Disable delivery errors, bad email addresses will be ignored
# config.action_mailer.raise_delivery_errors = false

# Uncomment the line below if you want to use the gateway in test mode while deployed in production
ActiveMerchant::Billing::Base.gateway_mode = :test

# #315 - New in 2.2 use a prefix (matches Passenger RailsBaseURI)
# ref: http://code.google.com/p/phusion-passenger/issues/detail?id=169
config.action_controller.relative_url_root = "/retail"