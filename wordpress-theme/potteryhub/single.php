<?php
/**
 * Single post.
 *
 * @package PotteryHub
 */

defined( 'ABSPATH' ) || exit;
get_header();
?>
<div class="std-page">
	<div class="pband"></div>
	<div class="pwrap narrow">
		<?php
		while ( have_posts() ) :
			the_post();
			?>
			<h1 class="ptitle serif"><?php the_title(); ?></h1>
			<?php the_post_thumbnail( 'large', array( 'class' => 'hero-img' ) ); ?>
			<div class="entry"><?php the_content(); ?></div>
		<?php endwhile; ?>
	</div>
</div>
<?php
get_footer();
