<?php
/**
 * Single journal post.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();

while ( have_posts() ) :
	the_post();
	$ph_c = get_the_category();
	?>
	<div class="tpl tpl-post">
		<div class="pband"></div>
		<article class="pwrap narrow">
			<div class="post-h">
				<div class="pc-meta rv"><?php echo esc_html( get_the_date() ); ?><?php if ( $ph_c ) : ?> · <a href="<?php echo esc_url( get_category_link( $ph_c[0] ) ); ?>"><?php echo esc_html( $ph_c[0]->name ); ?></a><?php endif; ?> · <?php /* translators: %d: minutes */ echo esc_html( sprintf( _n( '%d min read', '%d min read', max( 1, (int) round( str_word_count( wp_strip_all_tags( get_the_content() ) ) / 200 ) ), 'potteryhub' ), max( 1, (int) round( str_word_count( wp_strip_all_tags( get_the_content() ) ) / 200 ) ) ) ); ?></div>
				<h1 class="serif rv" style="--d:80ms"><?php the_title(); ?></h1>
			</div>
			<?php if ( has_post_thumbnail() ) : ?>
				<div class="post-img rv" style="--d:140ms"><?php the_post_thumbnail( 'full' ); ?></div>
			<?php endif; ?>
			<div class="entry post-body rv"><?php the_content(); ?></div>
			<?php wp_link_pages(); ?>
			<div class="post-f">
				<a class="see" href="<?php echo esc_url( ph_journal_url() ? ph_journal_url() : home_url( '/' ) ); ?>"><?php echo ph_icon( 'back', 14, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?> <?php esc_html_e( 'All stories', 'potteryhub' ); ?></a>
				<?php if ( class_exists( 'WooCommerce' ) ) : ?><a class="btn" href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Shop the collection', 'potteryhub' ); ?> <?php echo ph_icon( 'arrow', 16, 2 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a><?php endif; ?>
			</div>
		</article>
		<?php
		$ph_more = get_posts(
			array(
				'posts_per_page' => 3,
				'post__not_in'   => array( get_the_ID() ),
				'category__in'   => wp_list_pluck( $ph_c, 'term_id' ),
			)
		);
		if ( $ph_more ) :
			?>
			<div class="pwrap more-posts">
				<div class="sec-h"><div><div class="eyebrow"><?php esc_html_e( 'Journal', 'potteryhub' ); ?></div><h2 class="serif"><?php esc_html_e( 'Keep reading', 'potteryhub' ); ?></h2></div></div>
				<div class="posts">
					<?php
					global $post;
					foreach ( $ph_more as $ph_i => $post ) : // phpcs:ignore WordPress.WP.GlobalVariablesOverride
						setup_postdata( $post );
						get_template_part( 'parts/post-card', null, array( 'i' => $ph_i ) );
					endforeach;
					wp_reset_postdata();
					?>
				</div>
			</div>
		<?php endif; ?>
	</div>
	<?php
endwhile;
get_footer();
