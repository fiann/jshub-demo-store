# Methods added to this helper will be available to all templates in the application.
module MicroformatsHelper

  # A default empty hpage object if there is not one already defined
  DEFAULT_HPAGE = {
    :name => 'nothing defined',
    :categories => []
  }
  def hpage
    @hpage ||= DEFAULT_HPAGE
    if @hpage[:categories].nil? or @hpage[:categories].empty? and @taxon
      @hpage[:categories] = @taxon.ancestors.collect do |ancestor| 
        { :name => ancestor.name, :url => seo_url(ancestor) } #unless taxon.ancestors.empty?
      end
      @hpage[:categories] << { :name => @taxon.name, :url => seo_url(@taxon) }
    end
    @hpage
  end



end