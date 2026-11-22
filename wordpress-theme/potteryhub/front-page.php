<?php
/**
 * Homepage.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();

if ( ! class_exists( 'WooCommerce' ) ) {
	echo '<main class="pwrap"><p>' . esc_html__( 'Please activate WooCommerce.', 'potteryhub' ) . '</p></main>';
	get_footer();
	return;
}

/* Hero slides */
$ph_slides = array();
for ( $i = 1; $i <= 3; $i++ ) {
	$k           = 'ph_hero' . $i;
	$ph_slides[] = array(
		'img' => get_theme_mod( $k . '_img', ph_img( 'hero-' . $i . '.jpg' ) ),
		'fx'  => (int) get_theme_mod( $k . '_fx', array( 80, 64, 42 )[ $i - 1 ] ),
		'eb'  => ph_mod( $k . '_eb' ),
		't'   => ph_mod( $k . '_t' ),
		'p'   => ph_mod( $k . '_p' ),
		'cta' => ph_mod( $k . '_cta' ),
		'url' => ph_cat_link( $k . '_cat' ),
	);
}

/* Featured pieces: products marked "featured" (★), else best sellers */
$ph_feat = wc_get_products(
	array(
		'limit'      => 6,
		'status'     => 'publish',
		'featured'   => true,
		'visibility' => 'catalog',
	)
);
if ( ! $ph_feat ) {
	$ph_feat = ph_best_sellers( 6 );
}
$ph_feat_data = array();
foreach ( $ph_feat as $p ) {
	$ph_feat_data[] = array(
		'id'    => $p->get_id(),
		'name'  => $p->get_name(),
		'cat'   => ph_product_cat( $p ),
		'price' => ph_price( $p ),
		'img'   => ph_product_img( $p ),
		'url'   => $p->get_permalink(),
		'buy'   => ph_buy_url( $p ),
		'add'   => ph_quick_addable( $p ) ? 1 : 0,
	);
}

$ph_cats = ph_categories();
$ph_tile = array();
foreach ( array_slice( $ph_cats, 0, 4 ) as $t ) {
	$ph_tile[] = array(
		'name' => $t->name,
		'n'    => ph_pieces( $t->count ),
		'img'  => ph_cat_img( $t ),
		'url'  => get_term_link( $t ),
	);
}
$ph_f0 = $ph_feat_data ? $ph_feat_data[0] : null;
$ph_c0 = $ph_tile ? $ph_tile[0] : null;
?>
<section class="bento" id="hero" data-slides="<?php echo esc_attr( wp_json_encode( $ph_slides ) ); ?>" data-feat="<?php echo esc_attr( wp_json_encode( $ph_feat_data ) ); ?>" data-cats="<?php echo esc_attr( wp_json_encode( $ph_tile ) ); ?>">
	<div class="bgrid">
		<div class="bt bbig" id="bBig" style="--d:0ms">
			<div class="im on" data-first style="background-image:url('<?php echo esc_url( $ph_slides[0]['img'] ); ?>');background-position:<?php echo (int) $ph_slides[0]['fx']; ?>% 50%"></div>
			<div class="bx">
				<div class="eyebrow" id="bEb"><?php echo esc_html( $ph_slides[0]['eb'] ); ?></div>
				<h1 class="bth serif" id="bT"></h1>
				<p id="bP"><?php echo esc_html( $ph_slides[0]['p'] ); ?></p>
				<div class="row"><a class="btn" id="bCta" href="<?php echo esc_url( $ph_slides[0]['url'] ); ?>"><span><?php echo esc_html( $ph_slides[0]['cta'] ); ?></span><?php echo ph_icon( 'arrow', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a><div class="bdots" id="bDots"></div></div>
			</div>
		</div>
		<?php if ( $ph_f0 ) : ?>
		<div class="bt bfeat" id="bFeat" style="--d:120ms">
			<a class="cover" id="bFurl" href="<?php echo esc_url( $ph_f0['url'] ); ?>" aria-label="<?php echo esc_attr( $ph_f0['name'] ); ?>"></a>
			<div class="fx">
				<span class="pl"><?php esc_html_e( 'Featured piece', 'potteryhub' ); ?></span>
				<div class="swap"><div class="ct" id="bFc"><?php echo esc_html( $ph_f0['cat'] ); ?></div><h3 id="bFn"><?php echo esc_html( $ph_f0['name'] ); ?></h3><div class="pr" id="bFp"><?php echo $ph_f0['price']; // phpcs:ignore WordPress.Security.EscapeOutput ?></div></div>
				<div class="fb"><a class="btn" id="bFbuy" href="<?php echo esc_url( $ph_f0['buy'] ); ?>" rel="nofollow"><?php esc_html_e( 'Buy now', 'potteryhub' ); ?></a>
					<button class="rb" id="bFadd" type="button" aria-label="<?php esc_attr_e( 'Add to cart', 'potteryhub' ); ?>"><?php echo ph_icon( 'bag', 17, 1.7 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button></div>
			</div>
			<div class="fi"><img id="bFi" src="<?php echo esc_url( $ph_f0['img'] ); ?>" alt=""></div>
		</div>
		<?php endif; ?>
		<?php if ( $ph_c0 ) : ?>
		<a class="bt bcat" id="bCat" href="<?php echo esc_url( $ph_c0['url'] ); ?>" style="--d:220ms">
			<span class="barr"><?php echo ph_icon( 'arrow', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
			<small class="swap" id="bCn"><?php echo esc_html( $ph_c0['n'] ); ?></small><h4 class="swap" id="bCh"><?php echo esc_html( $ph_c0['name'] ); ?></h4>
			<span class="ci"><img id="bCi" src="<?php echo esc_url( $ph_c0['img'] ); ?>" alt=""></span>
		</a>
		<?php endif; ?>
		<?php
		$ph_c1i = count( $ph_tile ) > 1 ? (int) floor( count( $ph_tile ) / 2 ) : 0;
		$ph_c1  = $ph_tile ? $ph_tile[ $ph_c1i ] : null;
		if ( $ph_c1 ) :
			?>
		<a class="bt bcat bcat2" id="bCat2" data-start="<?php echo (int) $ph_c1i; ?>" href="<?php echo esc_url( $ph_c1['url'] ); ?>" style="--d:320ms">
			<span class="barr"><?php echo ph_icon( 'arrow', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
			<small class="swap"><?php echo esc_html( $ph_c1['n'] ); ?></small><h4 class="swap"><?php echo esc_html( $ph_c1['name'] ); ?></h4>
			<span class="ci"><img src="<?php echo esc_url( $ph_c1['img'] ); ?>" alt=""></span>
		</a>
		<?php endif; ?>
	</div>
</section>

<?php if ( $ph_cats ) : ?>
<section class="sec stays" id="cats">
	<?php echo ph_clay( 'clay-cats' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
	<div class="sec-h">
		<div><div class="eyebrow"><?php esc_html_e( 'Collections', 'potteryhub' ); ?></div><h2 class="serif"><?php esc_html_e( 'Shop by category', 'potteryhub' ); ?></h2></div>
		<div class="arrows"><button type="button" data-sc="-1" aria-label="<?php esc_attr_e( 'Previous', 'potteryhub' ); ?>"><?php echo ph_icon( 'back', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button><button type="button" data-sc="1" aria-label="<?php esc_attr_e( 'Next', 'potteryhub' ); ?>"><?php echo ph_icon( 'arrow', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button></div>
	</div>
	<div class="cats" id="catRow">
		<?php foreach ( $ph_cats as $ph_i => $t ) : ?>
			<a class="cat" data-rv style="--d:<?php echo (int) min( $ph_i, 5 ) * 90; ?>ms" href="<?php echo esc_url( get_term_link( $t ) ); ?>">
				<div class="cw"><img src="<?php echo esc_url( ph_cat_img( $t ) ); ?>" alt="" loading="lazy"></div>
				<b><?php echo esc_html( $t->name ); ?></b><small><?php echo esc_html( ph_pieces( $t->count ) ); ?></small>
			</a>
		<?php endforeach; ?>
	</div>
</section>
<?php endif; ?>

<main class="sec" id="popular">
	<?php echo ph_clay( 'clay-pop' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
	<div class="sec-h">
		<div><div class="eyebrow"><?php esc_html_e( 'The collection', 'potteryhub' ); ?></div><h2 class="serif"><?php esc_html_e( 'Popular of the Week', 'potteryhub' ); ?></h2><p><?php esc_html_e( 'The most loved pieces, shaped and glazed by hand', 'potteryhub' ); ?></p></div>
		<a class="see" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Shop all', 'potteryhub' ); ?> <?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
	</div>
	<?php $ph_tabs = array_merge( array( null ), array_slice( $ph_cats, 0, 5 ) ); ?>
	<div class="chips" id="chips">
		<?php foreach ( $ph_tabs as $ph_i => $t ) : ?>
			<button type="button" class="chip<?php echo 0 === $ph_i ? ' on' : ''; ?>" data-panel="<?php echo (int) $ph_i; ?>"><?php echo esc_html( $t ? $t->name : __( 'All', 'potteryhub' ) ); ?><sup><?php echo (int) ( $t ? $t->count : wp_count_posts( 'product' )->publish ); ?></sup></button>
		<?php endforeach; ?>
	</div>
	<?php foreach ( $ph_tabs as $ph_i => $t ) : ?>
		<div class="grid" data-panel="<?php echo (int) $ph_i; ?>"<?php echo $ph_i ? ' hidden' : ''; ?>>
			<?php
			foreach ( ph_best_sellers( 8, $t ? $t->slug : '' ) as $ph_j => $p ) {
				ph_card( $p, $ph_j );
			}
			?>
		</div>
	<?php endforeach; ?>
</main>


<section class="sec">
	<?php echo ph_clay( 'clay-promo' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
	<div class="promos">
		<?php
		for ( $i = 1; $i <= 2; $i++ ) :
			$k    = 'ph_promo' . $i;
			$pimg = get_theme_mod( $k . '_img', '' );
			if ( ! $pimg ) {
				$slug = get_theme_mod( $k . '_cat', ph_default_cat( $k . '_cat' ) );
				$term = $slug ? get_term_by( 'slug', $slug, 'product_cat' ) : null;
				$pimg = $term ? ph_cat_img( $term ) : ph_img( 'hero-' . $i . '.jpg' );
			}
			?>
			<div class="promo <?php echo 1 === $i ? 'a' : 'b'; ?>" data-rv style="--d:<?php echo ( $i - 1 ) * 120; ?>ms"><div class="pw"><img src="<?php echo esc_url( $pimg ); ?>" alt="" loading="lazy"></div>
				<div class="eyebrow" style="color:<?php echo 1 === $i ? '#e9a48f' : '#ffd9cb'; ?>"><?php echo esc_html( ph_mod( $k . '_eb' ) ); ?></div><h3><?php echo esc_html( ph_mod( $k . '_t' ) ); ?></h3><p><?php echo esc_html( ph_mod( $k . '_p' ) ); ?></p>
				<a class="wbtn" href="<?php echo esc_url( ph_cat_link( $k . '_cat' ) ); ?>"><?php echo esc_html( ph_mod( $k . '_cta' ) ); ?> <?php echo ph_icon( 'arrow', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a></div>
		<?php endfor; ?>
	</div>
</section>

<section class="band" id="classes" data-rv>
	<img data-par=".12" src="<?php echo esc_url( get_theme_mod( 'ph_band_img', 'https://potteryhubeg.com/wp-content/uploads/2024/07/w-hmp-video-2-image.jpg' ) ); ?>" alt="" loading="lazy">
	<div class="bt2">
		<div class="eyebrow"><?php echo esc_html( ph_mod( 'ph_band_eb' ) ); ?></div>
		<h2 class="serif"><?php echo esc_html( ph_mod( 'ph_band_t' ) ); ?></h2>
		<p><?php echo esc_html( ph_mod( 'ph_band_p' ) ); ?></p>
		<?php $ph_wk = ph_template_url( 'template-workshops.php' ); ?>
		<a class="btn" href="<?php echo esc_url( $ph_wk ? $ph_wk : get_theme_mod( 'ph_band_url', 'https://www.facebook.com/profile.php?id=61595757980356' ) ); ?>"<?php echo $ph_wk ? '' : ' target="_blank" rel="noopener"'; ?>><?php echo esc_html( ph_mod( 'ph_band_cta' ) ); ?> <?php echo ph_icon( 'arrow', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
	</div>
</section>
<?php
get_footer();
