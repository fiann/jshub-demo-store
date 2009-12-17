require(File.join(File.dirname(__FILE__), 'config', 'boot'))

require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

require 'tasks/rails'

unless Rake::Task.task_defined? "spree:release"
  Dir["#{SPREE_ROOT}/lib/tasks/**/*.rake"].sort.each { |ext| load ext }
end

# convert test output to XML for Hudson
# ref: http://blog.huikau.com/2008/01/09/jruby-ruby-continuous-integration-with-hudson/
require 'rubygems'
gem 'ci_reporter'
require 'ci/reporter/rake/test_unit'