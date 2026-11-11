<?php if ( ! defined('ABSPATH') ) exit; the_post();
$id=get_the_ID();
$type=cheops_first_term_name($id,'unit_type','Property');
$loc=cheops_first_term_name($id,'unit_location','');
$dev=cheops_first_term_name($id,'unit_developer','');
$deal=get_post_meta($id,'_cheops_listing_type',true) ?: 'sale';
$deal_label=cheops_listing_types()[$deal] ?? 'For Sale';
$period=get_post_meta($id,'_cheops_rent_period',true) ?: 'monthly';
$price=(float)get_post_meta($id,'_cheops_price',true);
$beds=(int)get_post_meta($id,'_cheops_beds',true);
$baths=(int)get_post_meta($id,'_cheops_baths',true);
$area=get_post_meta($id,'_cheops_area',true);
$garden=get_post_meta($id,'_cheops_garden_area',true);
$terrace=get_post_meta($id,'_cheops_terrace_area',true);
$roof=get_post_meta($id,'_cheops_roof_area',true);
$floor=get_post_meta($id,'_cheops_floor',true);
$project=get_post_meta($id,'_cheops_project',true);
$reference=get_post_meta($id,'_cheops_reference',true);
$delivery=get_post_meta($id,'_cheops_delivery',true);
$payment=get_post_meta($id,'_cheops_payment',true);
$installment=get_post_meta($id,'_cheops_installment',true);
$down=get_post_meta($id,'_cheops_downpayment',true);
$remaining=get_post_meta($id,'_cheops_remaining_balance',true);
$maintenance=get_post_meta($id,'_cheops_maintenance',true);
$due=get_post_meta($id,'_cheops_due_date',true);
$map=get_post_meta($id,'_cheops_map_url',true);
$video=get_post_meta($id,'_cheops_video_url',true);
$finish_key=get_post_meta($id,'_cheops_finishing',true); $finish=$finish_key ? (cheops_finishing_options()[$finish_key] ?? '') : cheops_finishing_options()['core-shell'];
$sale_key=get_post_meta($id,'_cheops_sale_type',true); $sale_type=$sale_key ? (cheops_sale_type_options()[$sale_key] ?? '') : '';
$selected=get_post_meta($id,'_cheops_amenities_selected',true); if(!is_array($selected))$selected=[];
$custom=array_filter(array_map('trim',explode(',',(string)get_post_meta($id,'_cheops_amenities',true))));
$amenities=array_values(array_unique(array_merge($selected,$custom)));
$gallery=array_filter(array_map('absint',explode(',',(string)get_post_meta($id,'_cheops_gallery_ids',true))));
$cover_id=get_post_thumbnail_id($id); if($cover_id) array_unshift($gallery,$cover_id); $gallery=array_values(array_unique($gallery));
$floorplan=(int)get_post_meta($id,'_cheops_floorplan_id',true);
$masterplan=(int)get_post_meta($id,'_cheops_masterplan_id',true);
$portfolio_cover_asset=get_post_meta($id,'_cheops_portfolio_cover',true);
$floorplan_asset=get_post_meta($id,'_cheops_floorplan_asset',true);
$masterplan_asset=get_post_meta($id,'_cheops_masterplan_asset',true);
$gallery_urls=[];
foreach($gallery as $gid){$u=wp_get_attachment_image_url($gid,'full');if($u)$gallery_urls[]=$u;}
if(function_exists('cheops_portfolio_asset_url')){
    foreach([$portfolio_cover_asset] as $asset){
        if($asset){$u=cheops_portfolio_asset_url($asset);if($u)$gallery_urls[]=$u;}
    }
}
$kit=function_exists('cheops_lake_town_kit') ? cheops_lake_town_kit($id) : null;
if($kit){
    $own=[]; $pool=cheops_lake_town_pool_ids();
    foreach($gallery as $gid){ if(in_array((int)$gid,$pool,true)) continue; $u=wp_get_attachment_image_url($gid,'full'); if($u) $own[]=$u; }
    $gallery_urls=array_merge([$kit['hero']],$own,$kit['photos']);
}
$gallery_urls=array_values(array_unique(array_filter($gallery_urls)));
if($kit && !$reference) $reference=$kit['number'];
$project_url=$project ? add_query_arg('project',rawurlencode($project),home_url('/properties/')) : '';
$project_coords=null;
if($project && function_exists('cheops_project_map_coords')){
    $pp=get_posts(['post_type'=>'cheops_project','post_status'=>'publish','posts_per_page'=>1,'title'=>$project,'fields'=>'ids']);
    if(!$pp){ foreach(get_posts(['post_type'=>'cheops_project','post_status'=>'publish','posts_per_page'=>-1,'fields'=>'ids']) as $cand){ if(strcasecmp(get_post_field('post_title',$cand),$project)===0){ $pp=[$cand]; break; } } }
    if($pp){ $lat=get_post_meta($pp[0],'_cheops_project_lat',true); $lng=get_post_meta($pp[0],'_cheops_project_lng',true); $project_coords=($lat!=='' && $lng!=='') ? [(float)$lat,(float)$lng] : cheops_project_map_coords(get_post_field('post_title',$pp[0]), $loc); }
}
$floorplan_url=$floorplan ? wp_get_attachment_image_url($floorplan,'full') : (($floorplan_asset && function_exists('cheops_portfolio_asset_url')) ? cheops_portfolio_asset_url($floorplan_asset) : '');
if(!$floorplan_url && !empty($kit)) $floorplan_url=$kit['plan'];
$masterplan_url=$masterplan ? wp_get_attachment_image_url($masterplan,'full') : (($masterplan_asset && function_exists('cheops_portfolio_asset_url')) ? cheops_portfolio_asset_url($masterplan_asset) : '');
$price_text=cheops_unit_price_text($id);
$is_leased=cheops_unit_status($id)==='leased';
$dev_term=null; $dev_terms=get_the_terms($id,'unit_developer'); if($dev_terms && !is_wp_error($dev_terms)) $dev_term=$dev_terms[0];
$dev_logo=$dev_term ? cheops_developer_logo_for($dev_term) : '';
$dev_about=$dev_term ? trim(term_description($dev_term)) : '';
if($is_leased || !cheops_show_unit_prices()){ $payment=$down=$installment=$remaining=$maintenance=$due=''; }
?><!doctype html><html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php cheops_page_css('single-unit'); ?>
<?php wp_head(); ?>
</head><body <?php body_class(); ?>><?php cheops_site_header(); ?>
<main class="sp-page">
<div class="sp-wrap">
  <nav class="sp-breadcrumbs" aria-label="Breadcrumb"><a href="<?php echo esc_url(home_url('/')); ?>">Home</a><span>›</span><a href="<?php echo esc_url(home_url('/properties/')); ?>">Properties</a><?php if($loc): ?><span>›</span><a href="<?php echo esc_url(add_query_arg('loc',rawurlencode($loc),home_url('/properties/'))); ?>"><?php echo esc_html($loc); ?></a><?php endif; ?><?php if($project): ?><span>›</span><a href="<?php echo esc_url($project_url); ?>"><?php echo esc_html($project); ?></a><?php endif; ?><span>›</span><b><?php the_title(); ?></b></nav>
  <?php if($gallery_urls): ?>
  <section class="sp-gallery<?php echo count($gallery_urls)===1?' is-single':''; ?>" id="propertyGallery">
    <?php foreach(array_slice($gallery_urls,0,5) as $index=>$media_url): ?><a href="<?php echo esc_url($media_url); ?>" class="sp-gallery-item" data-index="<?php echo esc_attr($index); ?>"><?php if($index===0): ?><img src="<?php echo esc_url($media_url); ?>"<?php echo cheops_srcset($media_url) ? ' srcset="'.esc_attr(cheops_srcset($media_url)).'" sizes="(max-width: 900px) 100vw, 60vw"' : ''; ?> fetchpriority="high" alt="<?php the_title_attribute(); ?>"><?php else: ?><img src="<?php echo esc_url(cheops_img_variant($media_url, 800)); ?>" loading="lazy" decoding="async" alt="<?php the_title_attribute(); ?>"><?php endif; ?></a><?php endforeach; ?>
    <button class="sp-gallery-more" type="button" id="openGallery">▦ View all <?php echo count($gallery_urls); ?> photos</button>
  </section>
  <?php else: ?><div class="sp-empty-gallery">Add a Featured Image or Property Gallery from the dashboard.</div><?php endif; ?>

  <div class="sp-layout">
    <article>
      <div><span class="sp-badge"><?php echo esc_html($deal_label); ?></span> <span class="sp-badge"><?php echo esc_html($type); ?></span> <span class="sp-badge cheops-status-badge is-<?php echo esc_attr(cheops_unit_status($id)); ?>"><?php echo esc_html(cheops_unit_status_label($id)); ?></span></div>
      <?php if($dev_logo || $kit): ?><div class="sp-brand"><?php if($kit): ?><a href="<?php echo esc_url($project_url); ?>"><img class="sp-brand-project" src="<?php echo esc_url($kit['logo']); ?>" alt="Lake Town"></a><?php elseif($project): ?><a href="<?php echo esc_url($project_url); ?>"><span><?php echo esc_html($project); ?></span></a><?php endif; ?><?php if($dev_logo): ?><img src="<?php echo esc_url($dev_logo); ?>" alt="<?php echo esc_attr($dev); ?>" loading="lazy" decoding="async"><?php endif; ?></div><?php endif; ?>
      <h1 class="sp-title"><?php the_title(); ?></h1>
      <div class="sp-location"><?php echo esc_html(implode(' · ',array_filter([$project,$loc,$dev]))); ?></div>
      <div class="sp-summary"><div class="sp-spec-grid">
        <?php if($reference): ?><div class="sp-spec"><small>Unit Number</small><strong><?php echo esc_html($reference); ?></strong></div><?php endif; ?>
        <?php if($type): ?><div class="sp-spec"><small>Property Type</small><strong><?php echo esc_html($type); ?></strong></div><?php endif; ?>
        <?php if($area): ?><div class="sp-spec"><small>Area</small><strong><?php echo esc_html($area); ?> m²</strong></div><?php endif; ?>
        <?php if($beds): ?><div class="sp-spec"><small>Bedrooms</small><strong><?php echo esc_html($beds); ?></strong></div><?php endif; ?>
        <?php if($baths): ?><div class="sp-spec"><small>Bathrooms</small><strong><?php echo esc_html($baths); ?></strong></div><?php endif; ?>
      </div></div>

      <section class="sp-section" id="details"><h2>Property details</h2><div class="sp-details">
        <?php foreach([
          ['Reference No.',$reference],['Listing',$deal_label],['Compound / Project',$project],['Developer',$dev],['Location',$loc],['Floor',$floor],['Delivery',$delivery],['Due Date / Milestone',$due],['Maintenance',$maintenance],['Remaining Balance',$remaining],['Finishing',$finish],['Sale Type',$deal==='sale'?$sale_type:''],['Garden Area',$garden?$garden.' m²':''],['Terrace Area',$terrace?$terrace.' m²':''],['Roof Area',$roof?$roof.' m²':'']
        ] as $row): if(!$row[1])continue; ?><div class="sp-detail"><span><?php echo esc_html($row[0]); ?></span><strong><?php echo esc_html($row[1]); ?></strong></div><?php endforeach; ?>
      </div></section>

      <?php if($amenities): ?><section class="sp-section"><h2>Amenities</h2><div class="sp-chips"><?php foreach($amenities as $a): ?><span class="sp-chip"><?php echo esc_html($a); ?></span><?php endforeach; ?></div></section><?php endif; ?>

      <?php if($payment || $down || $installment || $remaining || $maintenance || $due): ?><section class="sp-section"><h2><?php echo $deal==='rent'?'Rental terms':'Payment plan'; ?></h2><div class="sp-plan-card"><div><span class="sp-eyebrow"><?php echo $deal==='rent'?'Lease':'Offer'; ?></span><strong><?php echo esc_html($installment ?: $payment ?: $price_text); ?></strong><div class="sp-plan-meta"><?php if($payment): ?><span><?php echo esc_html($payment); ?></span><?php endif; ?><?php if($down): ?><span>Down payment: <?php echo esc_html($down); ?></span><?php endif; ?><?php if($remaining): ?><span>Remaining: <?php echo esc_html($remaining); ?></span><?php endif; ?><?php if($maintenance): ?><span>Maintenance: <?php echo esc_html($maintenance); ?></span><?php endif; ?><?php if($due): ?><span>Due: <?php echo esc_html($due); ?></span><?php endif; ?></div></div><a class="sp-btn" href="<?php echo esc_url(cheops_whatsapp_url(cheops_whatsapp_unit_message($id))); ?>" target="_blank" rel="noopener">Request details</a></div></section><?php endif; ?>

      <section class="sp-section"><h2>About <?php echo esc_html($type); ?></h2><div class="sp-copy"><?php if($kit): ?><p><?php echo esc_html($kit['intro']); ?></p><?php endif; ?><?php if(trim(get_the_content())){the_content();}elseif(!$kit){ ?><p><?php echo esc_html(sprintf('%s %s in %s%s%s.', $type, strtolower($deal_label), $project ?: $loc, $area?' with '.$area.' m²':'', $beds?' and '.$beds.' bedrooms':'')); ?></p><?php } ?></div></section>

      <?php foreach([['Floor Plan',$floorplan_url],['Master Plan',$masterplan_url]] as $plan): if(!$plan[1])continue; ?><section class="sp-section sp-plan-full"><h2><?php echo esc_html($plan[0]); ?></h2><a class="sp-plan-lightbox" href="<?php echo esc_url($plan[1]); ?>"><img src="<?php echo esc_url($plan[1]); ?>" alt="<?php echo esc_attr($plan[0].' · '.get_the_title()); ?>" loading="lazy" decoding="async"><div><?php echo esc_html($plan[0]); ?> ↗</div></a></section><?php endforeach; ?>

      <?php if($dev_term): ?><section class="sp-section sp-developer"><h2>About the developer</h2><div class="sp-developer-card"><?php if($dev_logo): ?><img src="<?php echo esc_url($dev_logo); ?>" alt="<?php echo esc_attr($dev); ?>" loading="lazy" decoding="async"><?php endif; ?><div><h3><?php echo esc_html($dev); ?></h3><?php if($dev_about): ?><div class="sp-copy"><?php echo wp_kses_post(wpautop($dev_about)); ?></div><?php elseif($project): ?><p class="sp-copy"><?php echo esc_html(cheops_is_ar() ? 'مطور مشروع ' . $project . '.' : 'Developer of ' . $project . '.'); ?></p><?php endif; ?></div></div></section><?php endif; ?>

      <?php if($kit){ cheops_render_lake_town_map($kit); } elseif($project_coords){ ?><section class="sp-section sp-pin-map" id="location"><h2>Location</h2><div id="spPinMap" data-lat="<?php echo esc_attr($project_coords[0]); ?>" data-lng="<?php echo esc_attr($project_coords[1]); ?>" data-name="<?php echo esc_attr($project); ?>" aria-label="<?php echo esc_attr($project.' on the map'); ?>"></div><a class="sp-map-link" href="<?php echo esc_url($project_url); ?>"><?php echo esc_html(cheops_is_ar() ? 'كل وحدات ' . $project . ' ←' : 'All units in ' . $project . ' →'); ?></a></section><?php if(function_exists('cheops_leaflet_loader_js')) cheops_leaflet_loader_js(); ?><script>(function(){function go(){var el=document.getElementById('spPinMap');if(!el)return;if(!window.L){setTimeout(go,150);return}if(el._leaflet_id)return;var c=[+el.dataset.lat,+el.dataset.lng];var m=L.map(el,{scrollWheelZoom:false,attributionControl:true}).setView(c,13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(m);L.marker(c,{icon:L.divIcon({className:'cheops-map-icon',html:'<span class="cheops-pin active"><i></i></span>',iconSize:[26,26],iconAnchor:[13,26]}),title:el.dataset.name}).addTo(m).bindTooltip(el.dataset.name,{direction:'top',offset:[0,-20],className:'cheops-tooltip',permanent:true});}var load=function(){window.cheopsWhenMapNear?window.cheopsWhenMapNear(go):go();};if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();load();}},{rootMargin:'300px'});io.observe(document.getElementById('spPinMap'));}else load();})();</script><?php } ?>
      <?php if($map): ?><section class="sp-section"><h2>Location</h2><a class="sp-map" href="<?php echo esc_url($map); ?>" target="_blank" rel="noopener"><span><small class="sp-eyebrow">View on map</small><br><b><?php echo esc_html($loc ?: $project); ?></b></span><span>↗</span></a></section><?php endif; ?>
    </article>

    <aside class="sp-side"><div class="sp-contact">
      <div class="sp-contact-label"><?php echo esc_html($deal_label); ?> · <?php echo esc_html($type); ?></div>
      <?php if(!cheops_show_unit_prices() || $is_leased): ?><div class="sp-price"><?php echo $is_leased ? 'Leased' : 'Interested in this unit?'; ?></div><div class="sp-price-sub">Our team will share availability and details privately.</div><?php else: ?><div class="sp-price"><?php echo esc_html($price_text); ?></div>
      <?php if($deal==='rent'): ?><div class="sp-price-sub">Rental amount · <?php echo esc_html(cheops_rent_periods()[$period] ?? 'Monthly'); ?></div><?php else: ?><div class="sp-price-sub">Final availability and terms are confirmed privately.</div><?php endif; endif; ?>
      <div class="sp-cta"><a class="sp-btn" href="<?php echo esc_url(cheops_phone_url()); ?>">Call us</a><a class="sp-btn alt" href="<?php echo esc_url(cheops_whatsapp_url(cheops_whatsapp_unit_message($id))); ?>" target="_blank" rel="noopener">WhatsApp</a></div>
      <div class="sp-mini">
        <?php foreach([['Unit Number',$reference,''],['Project',$project,$project_url],['Location',$loc,$loc?add_query_arg('loc',rawurlencode($loc),home_url('/properties/')):''],['Developer',$dev,'']] as $row): if(!$row[1])continue; ?><div class="sp-mini-row"><span><?php echo esc_html($row[0]); ?></span><strong><?php if($row[2]): ?><a href="<?php echo esc_url($row[2]); ?>"><?php echo esc_html($row[1]); ?></a><?php else: echo esc_html($row[1]); endif; ?></strong></div><?php endforeach; ?>
        <?php if($project_url): ?><a class="sp-all-units" href="<?php echo esc_url($project_url); ?>"><?php echo esc_html(cheops_is_ar() ? 'كل وحدات ' . $project . ' ←' : 'All units in ' . $project . ' →'); ?></a><?php endif; ?>
      </div>
    </div></aside>
  </div>
</div>

<section class="sp-related"><div class="sp-wrap"><div class="sp-related-head"><div><span class="sp-eyebrow">Explore more</span><h2>Suggested properties</h2></div><a href="<?php echo esc_url(home_url('/properties/')); ?>" style="color:inherit;text-decoration:none;font-size:11px">View all →</a></div><div class="sp-related-grid">
<?php
$related=[];
$base=['post_type'=>'cheops_unit','post_status'=>'publish','posts_per_page'=>3,'fields'=>'ids','no_found_rows'=>true];
$type_terms=get_the_terms($id,'unit_type'); $loc_terms=get_the_terms($id,'unit_location');
$tries=[];
if($project) $tries[]=['meta_key'=>'_cheops_project','meta_value'=>$project];
if($type_terms&&!is_wp_error($type_terms)) $tries[]=['tax_query'=>[['taxonomy'=>'unit_type','field'=>'term_id','terms'=>[$type_terms[0]->term_id]]]];
if($loc_terms&&!is_wp_error($loc_terms)) $tries[]=['tax_query'=>[['taxonomy'=>'unit_location','field'=>'term_id','terms'=>[$loc_terms[0]->term_id]]]];
foreach($tries as $t){ if(count($related)>=3) break; $related=array_merge($related,get_posts(array_merge($base,$t,['post__not_in'=>array_merge([$id],$related),'posts_per_page'=>3-count($related)]))); }
$rq=new WP_Query(['post_type'=>'cheops_unit','post__in'=>$related ?: [0],'orderby'=>'post__in','posts_per_page'=>3]);
while($rq->have_posts()):$rq->the_post();$rid=get_the_ID();$rimg=function_exists('cheops_unit_cover_url') ? cheops_unit_cover_url($rid,'medium_large') : get_the_post_thumbnail_url($rid,'medium_large');
?><a class="sp-related-card" href="<?php the_permalink(); ?>"><?php if($rimg): ?><img src="<?php echo esc_url(cheops_img_variant($rimg, 800)); ?>" loading="lazy" decoding="async" alt="<?php the_title_attribute(); ?>"><?php endif; ?><div class="sp-related-card-body"><h3><?php the_title(); ?></h3><p><?php echo esc_html(implode(' · ',array_filter([cheops_first_term_name($rid,'unit_type',''),cheops_first_term_name($rid,'unit_location','')]))); ?></p><div class="rprice"><?php echo esc_html(cheops_unit_card_price($rid)); ?></div></div></a><?php endwhile;wp_reset_postdata(); ?>
</div></div></section>
</main>

<?php if($gallery_urls): ?><div class="sp-lightbox" id="spLightbox"><button class="sp-lightbox-close" type="button">×</button><button class="sp-lightbox-prev" type="button">‹</button><img src="" alt=""><button class="sp-lightbox-next" type="button">›</button><div class="sp-lightbox-count"></div></div><script>
(()=>{const imgs=<?php echo wp_json_encode($gallery_urls); ?>;const lb=document.getElementById('spLightbox');if(!lb||!imgs.length)return;let i=0;const im=lb.querySelector('img'),ct=lb.querySelector('.sp-lightbox-count');function show(n){i=(n+imgs.length)%imgs.length;im.src=imgs[i];ct.textContent=(i+1)+' / '+imgs.length;lb.classList.add('open');document.body.style.overflow='hidden'}function close(){lb.classList.remove('open');document.body.style.overflow=''}document.querySelectorAll('.sp-gallery-item').forEach((a,index)=>a.addEventListener('click',e=>{e.preventDefault();show(Number(a.dataset.index||index))}));document.querySelectorAll('.sp-plan-lightbox').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();im.src=a.href;ct.textContent=a.querySelector('div')?.textContent.replace('↗','').trim()||'Plan';lb.classList.add('open');document.body.style.overflow='hidden'}));document.getElementById('openGallery')?.addEventListener('click',()=>show(0));lb.querySelector('.sp-lightbox-close').onclick=close;lb.querySelector('.sp-lightbox-prev').onclick=()=>show(i-1);lb.querySelector('.sp-lightbox-next').onclick=()=>show(i+1);lb.addEventListener('click',e=>{if(e.target===lb)close()});document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});})();
</script><?php endif; ?>
<?php wp_footer(); ?></body></html>