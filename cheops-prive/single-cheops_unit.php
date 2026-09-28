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
?><!doctype html><html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?>
<style>@font-face{
  font-family:"Romie";
  src:url(<?php echo esc_url( get_template_directory_uri() . '/assets/generated/79d5dddb2cad.otf' ); ?>) format("opentype");
  font-weight:400;
  font-style:normal;
  font-display:swap;
}
:root{--ink:#161616;--muted:#77716a;--line:#e8e3db;--gold:#b58d52;--cream:#f7f4ef;--white:#fff;--soft:#fcfbf9}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--white);color:var(--ink);font-family:"Romie",Georgia,"Times New Roman",serif}.sp-wrap{width:min(1280px,calc(100% - 44px));margin:auto}.sp-page{padding-top:112px}.sp-breadcrumbs{display:flex;gap:9px;align-items:center;flex-wrap:wrap;font-size:10px;color:#918b83;padding:22px 0}.sp-breadcrumbs a{color:inherit;text-decoration:none}.sp-breadcrumbs b{color:#4b4742;font-weight:500}.sp-gallery{display:grid;grid-template-columns:1.55fr .72fr .72fr;grid-template-rows:260px 260px;gap:10px;border-radius:22px;overflow:hidden;background:#eee}.sp-gallery>a{position:relative;display:block;overflow:hidden;background:#eee}.sp-gallery>a:first-child{grid-row:1/3}.sp-gallery img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.16,1,.3,1)}.sp-gallery a:hover img{transform:scale(1.025)}.sp-gallery-more{position:absolute;right:18px;bottom:18px;z-index:2;background:#fff;color:#111;border:0;border-radius:999px;padding:12px 15px;font-weight:700;font-size:10px;cursor:pointer;box-shadow:0 9px 25px rgba(0,0,0,.12)}.sp-placeholder{height:100%;display:grid;place-items:center;background:linear-gradient(135deg,#e9e4dc,#f7f4ef);color:#958e84}.sp-layout{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(330px,.65fr);gap:56px;padding:52px 0 100px}.sp-eyebrow{text-transform:uppercase;letter-spacing:.15em;font-size:9px;color:var(--gold);font-weight:700}.sp-title{font-family:"Romie",Georgia,"Times New Roman",serif;font-size:clamp(34px,4.5vw,59px);line-height:1.02;font-weight:400;margin:12px 0 14px}.sp-location{font-size:13px;color:var(--muted);display:flex;gap:9px;flex-wrap:wrap}.sp-badge{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;padding:7px 10px;font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:#fff}.sp-summary{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:26px 0;margin:30px 0}.sp-spec-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.sp-spec{min-height:100px;border:1px solid var(--line);border-radius:15px;padding:16px;background:var(--soft)}.sp-spec small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.09em;margin-bottom:10px}.sp-spec strong{font-family:"Romie",Georgia,"Times New Roman",serif;font-weight:400;font-size:20px}.sp-section{padding:34px 0;border-bottom:1px solid var(--line)}.sp-section h2{font-family:"Romie",Georgia,"Times New Roman",serif;font-size:31px;font-weight:400;margin:0 0 22px}.sp-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 30px}.sp-detail{display:flex;justify-content:space-between;gap:20px;padding:15px 0;border-bottom:1px solid var(--line);font-size:12px}.sp-detail span{color:var(--muted)}.sp-detail strong{text-align:right}.sp-chips{display:flex;flex-wrap:wrap;gap:10px}.sp-chip{border:1px solid var(--line);background:var(--soft);padding:12px 14px;border-radius:12px;font-size:12px;display:flex;align-items:center;gap:8px}.sp-chip:before{content:'✓';color:var(--gold);font-weight:800}.sp-plan-card{background:var(--cream);border-radius:18px;padding:24px;display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}.sp-plan-card strong{font-family:"Romie",Georgia,"Times New Roman",serif;font-size:24px;font-weight:400}.sp-plan-meta{display:flex;gap:24px;flex-wrap:wrap;margin-top:10px;font-size:11px;color:var(--muted)}.sp-copy{font-size:14px;line-height:1.9;color:#5f5a54}.sp-copy p:first-child{margin-top:0}.sp-plan-images{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.sp-plan-image{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--soft)}.sp-plan-image img{width:100%;display:block;aspect-ratio:16/10;object-fit:contain;background:#fff}.sp-plan-image div{padding:14px 16px;font-weight:700;font-size:11px}.sp-side{position:sticky;top:118px;align-self:start}.sp-contact{border:1px solid var(--line);border-radius:22px;padding:26px;background:#fff;box-shadow:0 22px 70px -50px rgba(0,0,0,.45)}.sp-contact-label{font-size:9px;text-transform:uppercase;letter-spacing:.13em;color:var(--muted)}.sp-price{font-family:"Romie",Georgia,"Times New Roman",serif;font-size:34px;line-height:1.05;margin:10px 0 4px}.sp-price-sub{color:var(--muted);font-size:11px}.sp-cta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}.sp-btn{display:flex;align-items:center;justify-content:center;text-decoration:none;border-radius:999px;padding:15px 14px;font-weight:700;font-size:10px;letter-spacing:.06em;text-transform:uppercase;background:var(--ink);color:#fff}.sp-btn.alt{background:var(--cream);color:var(--ink)}.sp-mini{margin-top:20px;padding-top:18px;border-top:1px solid var(--line)}.sp-mini-row{display:flex;justify-content:space-between;gap:20px;font-size:11px;padding:9px 0}.sp-mini-row span{color:var(--muted)}.sp-mini-row strong{text-align:right}.sp-map{display:flex;align-items:center;justify-content:space-between;gap:20px;border:1px solid var(--line);border-radius:16px;padding:20px;text-decoration:none;color:inherit;background:var(--soft)}.sp-map b{font-family:"Romie",Georgia,"Times New Roman",serif;font-size:22px;font-weight:400}.sp-related{padding:80px 0 100px;background:var(--cream)}.sp-related-head{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:30px}.sp-related h2{font-family:"Romie",Georgia,"Times New Roman",serif;font-size:40px;font-weight:400;margin:0}.sp-related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.sp-related-card{display:block;text-decoration:none;color:inherit;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #ece6dd}.sp-related-card img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}.sp-related-card-body{padding:18px}.sp-related-card h3{font-family:"Romie",Georgia,"Times New Roman",serif;font-size:20px;font-weight:400;margin:0 0 7px}.sp-related-card p{margin:0;color:var(--muted);font-size:11px}.sp-related-card .rprice{margin-top:13px;padding-top:14px;border-top:1px solid var(--line);font-family:"Romie",Georgia,"Times New Roman",serif;font-size:16px;color:var(--ink)}.sp-lightbox{position:fixed;inset:0;background:rgba(8,8,8,.96);z-index:10050;display:none;align-items:center;justify-content:center;padding:64px 30px}.sp-lightbox.open{display:flex}.sp-lightbox img{max-width:min(1200px,92vw);max-height:84vh;object-fit:contain}.sp-lightbox-close,.sp-lightbox-prev,.sp-lightbox-next{position:absolute;border:0;background:rgba(255,255,255,.12);color:#fff;width:46px;height:46px;border-radius:50%;font-size:22px;cursor:pointer}.sp-lightbox-close{right:24px;top:24px}.sp-lightbox-prev{left:24px;top:50%}.sp-lightbox-next{right:24px;top:50%}.sp-lightbox-count{position:absolute;bottom:24px;color:#fff;font-size:11px;letter-spacing:.1em}.sp-empty-gallery{height:460px;border-radius:22px;background:linear-gradient(135deg,#e9e4dc,#f7f4ef);display:grid;place-items:center;color:#938b81}
@media(max-width:980px){.sp-layout{grid-template-columns:1fr}.sp-side{position:static}.sp-gallery{grid-template-columns:1.4fr .8fr;grid-template-rows:220px 220px}.sp-gallery>a:nth-child(n+4){display:none}.sp-spec-grid{grid-template-columns:repeat(2,1fr)}.sp-related-grid{grid-template-columns:1fr 1fr}.sp-plan-images{grid-template-columns:1fr}}
@media(max-width:640px){.sp-wrap{width:min(100% - 24px,1280px)}.sp-page{padding-top:96px}.sp-gallery{grid-template-columns:1fr;grid-template-rows:330px}.sp-gallery>a:first-child{grid-row:auto}.sp-gallery>a:not(:first-child){display:none}.sp-layout{padding-top:34px;gap:30px}.sp-title{font-size:34px}.sp-spec-grid{grid-template-columns:1fr 1fr}.sp-details{grid-template-columns:1fr}.sp-cta{grid-template-columns:1fr}.sp-related-grid{grid-template-columns:1fr}.sp-plan-card{grid-template-columns:1fr}.sp-related{padding:54px 0}.sp-related h2{font-size:31px}}
</style></head><body <?php body_class(); ?>><?php cheops_site_header(); ?>
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