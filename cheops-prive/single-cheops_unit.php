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
$finish_key=get_post_meta($id,'_cheops_finishing',true); $finish=cheops_finishing_options()[$finish_key] ?? '';
$sale_key=get_post_meta($id,'_cheops_sale_type',true); $sale_type=cheops_sale_type_options()[$sale_key] ?? '';
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
    foreach([$portfolio_cover_asset,$masterplan_asset,$floorplan_asset] as $asset){
        if($asset){$u=cheops_portfolio_asset_url($asset);if($u)$gallery_urls[]=$u;}
    }
}
$gallery_urls=array_values(array_unique(array_filter($gallery_urls)));
$floorplan_url=$floorplan ? wp_get_attachment_image_url($floorplan,'full') : (($floorplan_asset && function_exists('cheops_portfolio_asset_url')) ? cheops_portfolio_asset_url($floorplan_asset) : '');
$masterplan_url=$masterplan ? wp_get_attachment_image_url($masterplan,'full') : (($masterplan_asset && function_exists('cheops_portfolio_asset_url')) ? cheops_portfolio_asset_url($masterplan_asset) : '');
$price_text=cheops_unit_price_text($id);
?><!doctype html><html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php cheops_page_css('single-unit'); ?>
<?php wp_head(); ?>
</head><body <?php body_class(); ?>><?php cheops_site_header(); ?>
<main class="sp-page">
<div class="sp-wrap">
  <nav class="sp-breadcrumbs" aria-label="Breadcrumb"><a href="<?php echo esc_url(home_url('/')); ?>">Home</a><span>›</span><a href="<?php echo esc_url(home_url('/properties/')); ?>">Properties</a><?php if($loc): ?><span>›</span><span><?php echo esc_html($loc); ?></span><?php endif; ?><span>›</span><b><?php the_title(); ?></b></nav>
  <?php if($gallery_urls): ?>
  <section class="sp-gallery" id="propertyGallery">
    <?php foreach(array_slice($gallery_urls,0,5) as $index=>$media_url): ?><a href="<?php echo esc_url($media_url); ?>" class="sp-gallery-item" data-index="<?php echo esc_attr($index); ?>"><img src="<?php echo esc_url($media_url); ?>" alt="<?php the_title_attribute(); ?>"></a><?php endforeach; ?>
    <button class="sp-gallery-more" type="button" id="openGallery">▦ View all <?php echo count($gallery_urls); ?> photos</button>
  </section>
  <?php else: ?><div class="sp-empty-gallery">Add a Featured Image or Property Gallery from the dashboard.</div><?php endif; ?>

  <div class="sp-layout">
    <article>
      <div><span class="sp-badge"><?php echo esc_html($deal_label); ?></span> <span class="sp-badge"><?php echo esc_html($type); ?></span></div>
      <h1 class="sp-title"><?php the_title(); ?></h1>
      <div class="sp-location"><?php echo esc_html(implode(' · ',array_filter([$project,$loc,$dev]))); ?></div>
      <div class="sp-summary"><div class="sp-spec-grid">
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

      <section class="sp-section"><h2>About <?php echo esc_html($type); ?></h2><div class="sp-copy"><?php if(trim(get_the_content())){the_content();}else{ ?><p><?php echo esc_html(sprintf('%s %s in %s%s%s.', $type, strtolower($deal_label), $project ?: $loc, $area?' with '.$area.' m²':'', $beds?' and '.$beds.' bedrooms':'')); ?></p><?php } ?></div></section>

      <?php if($floorplan_url || $masterplan_url): ?><section class="sp-section"><h2>Plans</h2><div class="sp-plan-images"><?php foreach([['Floor Plan',$floorplan_url],['Unit Location',$masterplan_url]] as $plan): if(!$plan[1])continue; ?><a class="sp-plan-image sp-plan-lightbox" href="<?php echo esc_url($plan[1]); ?>"><img src="<?php echo esc_url($plan[1]); ?>" alt="<?php echo esc_attr($plan[0]); ?>"><div><?php echo esc_html($plan[0]); ?> ↗</div></a><?php endforeach; ?></div></section><?php endif; ?>

      <?php if($map): ?><section class="sp-section"><h2>Location</h2><a class="sp-map" href="<?php echo esc_url($map); ?>" target="_blank" rel="noopener"><span><small class="sp-eyebrow">View on map</small><br><b><?php echo esc_html($loc ?: $project); ?></b></span><span>↗</span></a></section><?php endif; ?>
    </article>

    <aside class="sp-side"><div class="sp-contact">
      <div class="sp-contact-label"><?php echo esc_html($deal_label); ?> · <?php echo esc_html($type); ?></div>
      <div class="sp-price"><?php echo esc_html($price_text); ?></div>
      <?php if($deal==='rent'): ?><div class="sp-price-sub">Rental amount · <?php echo esc_html(cheops_rent_periods()[$period] ?? 'Monthly'); ?></div><?php else: ?><div class="sp-price-sub">Final availability and terms are confirmed privately.</div><?php endif; ?>
      <div class="sp-cta"><a class="sp-btn" href="<?php echo esc_url(cheops_phone_url()); ?>">Call us</a><a class="sp-btn alt" href="<?php echo esc_url(cheops_whatsapp_url(cheops_whatsapp_unit_message($id))); ?>" target="_blank" rel="noopener">WhatsApp</a></div>
      <div class="sp-mini">
        <?php foreach([['Reference',$reference],['Project',$project],['Location',$loc],['Developer',$dev]] as $row): if(!$row[1])continue; ?><div class="sp-mini-row"><span><?php echo esc_html($row[0]); ?></span><strong><?php echo esc_html($row[1]); ?></strong></div><?php endforeach; ?>
      </div>
    </div></aside>
  </div>
</div>

<section class="sp-related"><div class="sp-wrap"><div class="sp-related-head"><div><span class="sp-eyebrow">Explore more</span><h2>Suggested properties</h2></div><a href="<?php echo esc_url(home_url('/properties/')); ?>" style="color:inherit;text-decoration:none;font-size:11px">View all →</a></div><div class="sp-related-grid">
<?php
$tax_query=[];
if($loc){$terms=get_the_terms($id,'unit_location'); if($terms&&!is_wp_error($terms))$tax_query[]=['taxonomy'=>'unit_location','field'=>'term_id','terms'=>[$terms[0]->term_id]];}
$rq=new WP_Query(['post_type'=>'cheops_unit','post_status'=>'publish','posts_per_page'=>3,'post__not_in'=>[$id],'tax_query'=>$tax_query]);
if(!$rq->have_posts())$rq=new WP_Query(['post_type'=>'cheops_unit','post_status'=>'publish','posts_per_page'=>3,'post__not_in'=>[$id]]);
while($rq->have_posts()):$rq->the_post();$rid=get_the_ID();$rimg=get_the_post_thumbnail_url($rid,'medium_large');
if(!$rimg && function_exists('cheops_portfolio_asset_url')){$rasset=get_post_meta($rid,'_cheops_portfolio_cover',true);if($rasset)$rimg=cheops_portfolio_asset_url($rasset);}
?><a class="sp-related-card" href="<?php the_permalink(); ?>"><?php if($rimg): ?><img src="<?php echo esc_url($rimg); ?>" alt="<?php the_title_attribute(); ?>"><?php endif; ?><div class="sp-related-card-body"><h3><?php the_title(); ?></h3><p><?php echo esc_html(implode(' · ',array_filter([cheops_first_term_name($rid,'unit_type',''),cheops_first_term_name($rid,'unit_location','')]))); ?></p><div class="rprice"><?php echo esc_html(cheops_unit_price_text($rid)); ?></div></div></a><?php endwhile;wp_reset_postdata(); ?>
</div></div></section>
</main>

<?php if($gallery_urls): ?><div class="sp-lightbox" id="spLightbox"><button class="sp-lightbox-close" type="button">×</button><button class="sp-lightbox-prev" type="button">‹</button><img src="" alt=""><button class="sp-lightbox-next" type="button">›</button><div class="sp-lightbox-count"></div></div><script>
(()=>{const imgs=<?php echo wp_json_encode($gallery_urls); ?>;const lb=document.getElementById('spLightbox');if(!lb||!imgs.length)return;let i=0;const im=lb.querySelector('img'),ct=lb.querySelector('.sp-lightbox-count');function show(n){i=(n+imgs.length)%imgs.length;im.src=imgs[i];ct.textContent=(i+1)+' / '+imgs.length;lb.classList.add('open');document.body.style.overflow='hidden'}function close(){lb.classList.remove('open');document.body.style.overflow=''}document.querySelectorAll('.sp-gallery-item').forEach((a,index)=>a.addEventListener('click',e=>{e.preventDefault();show(Number(a.dataset.index||index))}));document.querySelectorAll('.sp-plan-lightbox').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();im.src=a.href;ct.textContent=a.querySelector('div')?.textContent.replace('↗','').trim()||'Plan';lb.classList.add('open');document.body.style.overflow='hidden'}));document.getElementById('openGallery')?.addEventListener('click',()=>show(0));lb.querySelector('.sp-lightbox-close').onclick=close;lb.querySelector('.sp-lightbox-prev').onclick=()=>show(i-1);lb.querySelector('.sp-lightbox-next').onclick=()=>show(i+1);lb.addEventListener('click',e=>{if(e.target===lb)close()});document.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')close();if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});})();
</script><?php endif; ?>
<?php wp_footer(); ?></body></html>